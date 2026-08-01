import io
import os
import shutil
from datetime import datetime, timezone

import pdfkit
from app import app, db
from decorators import token_required
from flask import jsonify, make_response, render_template, request, send_file

# Models
from src.models.certificadomodel import CertificadoModel as Certificado
from src.models.cursoactivomodel import CursoActivoModel as CursoActivo
from src.models.cursomodel import CursoModel as Curso
from src.models.cursoscontenidomodel import CursoContenidoModel as CursoContenido
from src.models.personasmodel import PersonasModel as Personas
from src.models.preimpresomodel import PreImpresoModel as PreImpreso
from src.models.tipoformacionmodel import TipoFormacionModel as TipoFormacion
from src.models.vigenciacertificadosmodel import (
    VigenciaCertificadosModel as VigenciaCertificados,
)
from src.models.vw_curso_certificado import VwCursoCertificado as CursoCertificado
from src.models.vw_curso_publicado import VwCursoPublicado

# services
from src.services.certificates_services import parse_massive_certificates_csv


def _get_pdfkit_configuration():
    wkhtmltopdf_env = os.getenv('WKHTMLTOPDF_PATH')
    wkhtmltopdf_path = wkhtmltopdf_env or shutil.which('wkhtmltopdf')

    if not wkhtmltopdf_path:
        common_paths = [
            '/usr/bin/wkhtmltopdf',
            '/usr/local/bin/wkhtmltopdf',
        ]
        for candidate in common_paths:
            if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                wkhtmltopdf_path = candidate
                break

    if not wkhtmltopdf_path:
        return None

    return pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)


@app.route('/api/certificates/masive/<string:preimpress>', methods=['POST'])
@token_required
def create_certificate_masive(preimpress: str):
    try:
        file = request.files.get('file')
        preimpreso_form = request.form.get('preimpreso', '').strip()

        if not file:
            return jsonify({'error': 'No se proporcionó el archivo CSV.'}), 400

        if not preimpreso_form:
            return jsonify({'error': 'No se proporcionó el preimpreso en el formulario.'}), 400

        if preimpreso_form != preimpress.strip():
            return jsonify({'error': 'El preimpreso del formulario no coincide con la ruta solicitada.'}), 400

        data_preimpress = PreImpreso.query.filter_by(
            preimpreso=preimpress.strip()).first()
        if not data_preimpress:
            return jsonify({'error': 'El preimpreso indicado no existe.'}), 404

        csv_result = parse_massive_certificates_csv(file)

        if not csv_result.get('ok'):
            error_payload = {'error': csv_result.get(
                'error', 'Error al procesar CSV.')}
            if csv_result.get('expected') is not None:
                error_payload['expected'] = csv_result.get('expected')
            if csv_result.get('received') is not None:
                error_payload['received'] = csv_result.get('received')
            if csv_result.get('row') is not None:
                error_payload['row'] = csv_result.get('row')
            if csv_result.get('field') is not None:
                error_payload['field'] = csv_result.get('field')
            if csv_result.get('value') is not None:
                error_payload['value'] = csv_result.get('value')
            return jsonify(error_payload), int(csv_result.get('status', 400))

        parsed_rows = csv_result.get('rows', [])

        for row in parsed_rows:
            persona = Personas.query.filter_by(cedula=row['cedula']).first()
            if not persona:
                persona = Personas(
                    nac=row['nacionalidad'],
                    cedula=row['cedula'],
                    nombres=row['nombres'],
                    apellidos=row['apellidos'],
                    sexo=row['genero'],
                    fecha_nace=row['nacimiento'],
                    telefono=row['telefono'],
                    correo=row['correo']
                )
                db.session.add(persona)
                db.session.flush()

            # Verificar si ya existe un certificado para esta persona y preimpreso
            existing_certificado = Certificado.query.filter_by(
                id_persona=persona.cedula,
                preimpreso_id=data_preimpress.id
            ).first()

            if not existing_certificado:
                certificado = Certificado(
                    id_persona=persona.cedula,
                    consecutivo=row['consecutivo'],
                    titulo_asociado=row['codigo_asociado'],
                    fecha_emision=datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                    preimpreso_id=data_preimpress.id,
                )
                db.session.add(certificado)

        db.session.commit()

        return jsonify({
            'message': f'Se procesaron {len(parsed_rows)} fila(s) del CSV.',
            'preimpreso': preimpress.strip(),
            'rows': parsed_rows,
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/certificates/courses', methods=['GET'])
@token_required
def get_certificates():
    try:
        # Parámetros de paginación y búsqueda
        page = request.args.get('page', default=1, type=int)
        page_size = request.args.get('page_size', default=50, type=int)
        q = request.args.get('q', default='', type=str).strip()

        # Validaciones
        if page < 1:
            page = max(page, 1)
        if page_size < 1:
            page_size = max(page_size, 1)
        if page_size > 200:
            page_size = min(page_size, 200)

        # Filtro base
        query = CursoCertificado.query
        if q:
            # Busca por coincidencia en preimpreso o curso
            query = query.filter(CursoCertificado.preimpreso.ilike(
                f"%{q}%") | CursoCertificado.nombre.ilike(f"%{q}%") | CursoCertificado.shortname.ilike(f"%{q}%"))

        total = query.count()
        total_pages = (total + page_size - 1) // page_size

        cursos = query.order_by(CursoCertificado.preimpreso_id.desc()).offset(
            (page - 1) * page_size).limit(page_size).all()

        courses = []
        for curso in cursos:
            data = {}
            data["id"] = curso.preimpreso_id
            data["curso_activo_id"] = curso.curso_activo_id
            data["id_cfs"] = curso.id_cfs
            data["id_estado"] = curso.estado_id
            data["shortname"] = curso.shortname
            data["preimpreso_id"] = curso.preimpreso_id
            data["preimpreso"] = curso.preimpreso
            data["hoja"] = curso.hoja
            data["libro"] = curso.libro
            data["curso"] = curso.nombre
            data["participantes"] = curso.certificados
            data["fecha_inicio"] = curso.fecha_ini
            data["fecha_fin"] = curso.fecha_fin
            data["fecha_emision"] = curso.fecha_emision
            courses.append(data)

        meta = {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

        return jsonify({"data": courses, "meta": meta}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/certificates/templates', methods=['GET'])
def get_current_certificates():
    try:
        template_certificates = VigenciaCertificados.query.order_by(
            VigenciaCertificados.is_vigente.desc()).all()

        def safe_serialize(obj):
            data = obj.serialize()
            tipo_formacion = TipoFormacion.query.get(obj.id_tipo_formacion)
            data['modalidad'] = tipo_formacion.nombre if tipo_formacion else None
            for k, v in data.items():
                if isinstance(v, bytes):
                    data[k] = v.decode('utf-8')
            return data

        return jsonify({"data": [safe_serialize(cert) for cert in template_certificates]}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/certificates/<preimpress_id>', methods=['GET'])
@token_required
def get_certificates_by_preimpress(preimpress_id):
    try:
        data = []
        preimpreso_data = PreImpreso.query.filter_by(
            id=preimpress_id).first()

        if not preimpreso_data:
            return jsonify({'message': 'Preimpreso not found'}), 404

        certificates = Certificado.query.filter_by(
            preimpreso_id=preimpreso_data.id).all()

        for cert in certificates:
            persona = Personas.query.filter_by(cedula=cert.id_persona).first()

            data.append({
                "certificateId": cert.id,
                "consecutivo": str(cert.consecutivo).zfill(7),
                "tituloAsociado": cert.titulo_asociado if cert.titulo_asociado else None,
                "nacionalidad": persona.nac if persona else None,
                "cedula": persona.cedula if persona else None,
                "nombres": persona.nombres if persona else None,
                "apellidos": persona.apellidos if persona else None,
                "genero": persona.sexo if persona else None,
                "fechaNace": persona.fecha_nace if persona else None,
                "telefono": persona.telefono if persona else None,
                "correo": persona.correo if persona else None,
            })

        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/certificate/<id_person>', methods=['GET'])
def get_certificado(id_person):
    try:
        data = []
        certificates = Certificado.query.filter_by(id_persona=id_person).all()
        if not certificates:
            return jsonify({'message': 'Certificate not found'}), 404

        for cert in certificates:
            preimpreso = PreImpreso.query.filter_by(id=cert.preimpreso_id).first()
            course = VwCursoPublicado.query.filter_by(
                id_cur_activo=preimpreso.id_curso_activo).first()
            data.append({
                "idCertificate": cert.id,
                "course": course.curso if course else None
            })

        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/viewcertificate/<certificate>', methods=['GET'])
def view_certificate(certificate):
    try:
        certificate_data = Certificado.query.filter_by(id=certificate).first()
        preimpreso_data = PreImpreso.query.filter_by(
            id=certificate_data.preimpreso_id).first()
        persona = Personas.query.filter_by(
            cedula=certificate_data.id_persona).first()
        curso_activo = CursoActivo.query.filter_by(
            id=preimpreso_data.id_curso_activo).first()
        curso = Curso.query.filter_by(id=curso_activo.id_curso).first()
        curso_contenido = CursoContenido.query.filter_by(
            shortname_curso=curso.shortname).all()

        curso_total_horas = sum(int(contenido.horas or 0)
                                for contenido in curso_contenido)

        num_curso_contenido = len(curso_contenido)

        correlativo = f"{str(curso_activo.id_cfs).zfill(3)}{str(curso.tipo_formacion).zfill(2)}{str(preimpreso_data.libro).zfill(3)}{str(preimpreso_data.hoja).zfill(3)}{str(certificate_data.consecutivo).zfill(7)}{curso_activo.fecha_fin.strftime('%Y')}"

        school_year = f"{certificate_data.fecha_emision.year - 1} - {certificate_data.fecha_emision.year}"

        cert = f"Certificado_{preimpreso_data.preimpreso}_{str(certificate_data.consecutivo).zfill(7)}"
        namefile = cert + '.pdf'
        namepath = "src/view/certificates/" + namefile
        os.makedirs("src/view/certificates/", exist_ok=True)

        url = f"https://app.inces.net.ve/verifycertificate?={certificate}"

        tipo_formacion = int(str(curso.tipo_formacion).strip())
        id_programa = int(str(curso.id_programa).strip())

        template = f"/certificates/{tipo_formacion}_{id_programa}.html"

        html = render_template(template,
                               base_url=app.config['BASE_URL'],
                               persona=persona.serialize(),
                               certificate=certificate_data.serialize(),
                               preimpreso=preimpreso_data.serialize(),
                               curso=curso.serialize(),
                               curso_activo=curso_activo.serialize(),
                               curso_contenido=[contenido.serialize()
                                                for contenido in curso_contenido],
                               url=url,
                               total_horas=curso_total_horas,
                               correlativo=correlativo,
                               school_year=school_year,
                               num_curso_contenido=num_curso_contenido
                               )

        # Configuración de pdfkit para orientación horizontal
        options = {
            'page-size': 'A4',
            'orientation': 'Landscape',
            'encoding': 'UTF-8',
            'background': None,
            'print-media-type': None,
            'enable-local-file-access': None,
            'no-outline': None,
            'quiet': ''
        }

        pdf_config = _get_pdfkit_configuration()

        if not pdf_config:
            return jsonify({
                'error': 'No se encontro wkhtmltopdf. Instala el binario o define WKHTMLTOPDF_PATH con la ruta absoluta.'
            }), 500

        pdfkit.from_string(html, namepath, options=options,
                           configuration=pdf_config)
        with open(namepath, 'rb') as bites:
            pdfData = bites.read()
        os.remove(namepath)
        response = make_response(send_file(io.BytesIO(
            pdfData), mimetype='application/pdf', as_attachment=True, download_name=namefile))
        response.headers['Content-Disposition'] = f'inline; filename={namefile}'
        response.headers['Content-Type'] = 'application/pdf'

        return response
    except Exception as e:
        return {"error": str(e)}
