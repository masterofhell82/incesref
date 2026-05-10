from app import app
from flask import jsonify, render_template, make_response, send_file, request
import os
import io
import shutil
from decorators import token_required
import pdfkit

# Models
from src.models.certificadomodel import CertificadoModel as Certificado
from src.models.tipoformacionmodel import TipoFormacionModel as TipoFormacion
from src.models.personasmodel import PersonasModel as Personas
from src.models.preimpresomodel import PreImpresoModel as PreImpreso
from src.models.vigenciacertificadosmodels import VigenciaCertificadosModel as VigenciaCertificados
from src.models.vw_curso_publicado import VwCursoPublicado as VwCursoPublicado
from src.models.vw_curso_certificado import VwCursoCertificado as CursoCertificado


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
            page = 1
        if page_size < 1:
            page_size = 1
        if page_size > 200:
            page_size = 200

        # Filtro base
        query = CursoCertificado.query
        if q:
            # Busca por coincidencia en preimpreso o curso
            query = query.filter(CursoCertificado.preimpreso.ilike(f"%{q}%") | CursoCertificado.nombre.ilike(f"%{q}%"))

        total = query.count()
        total_pages = (total + page_size - 1) // page_size

        cursos = query.order_by(CursoCertificado.preimpreso_id.desc()).offset((page - 1) * page_size).limit(page_size).all()

        courses = []
        for curso in cursos:
            data = {}
            data["id"] = curso.preimpreso_id
            data["curso_activo_id"] = curso.curso_activo_id
            data["id_cfs"] = curso.id_cfs
            data["shortname"] = curso.shortname
            data["preimpreso"] = curso.preimpreso
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
            "has_prev": page > 1
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


@app.route('/api/certificates/<preimpress>', methods=['GET'])
# @token_required
def get_certificates_by_course(preimpress):
    try:
        data = []
        preimpreso_data = PreImpreso.query.filter_by(
            preimpreso=preimpress).first()

        if not preimpreso_data:
            return jsonify({'message': 'Preimpreso not found'}), 404

        certificates = Certificado.query.filter_by(
            id_curso_activo=preimpreso_data.id_curso_activo).all()

        for cert in certificates:
            persona = Personas.query.filter_by(cedula=cert.id_persona).first()

            data.append({
                "certificateId": cert.id,
                "cedula": persona.cedula if persona else None,
                "nombres": persona.nombres if persona else None,
                "apellidos": persona.apellidos if persona else None,
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
            course = VwCursoPublicado.query.filter_by(
                id_cur_activo=cert.id_curso_activo).first()
            data.append({
                "idCertificate": cert.id,
                "course": course.curso if course else None
            })

        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/viewcertificate/<certificate>', methods=['GET'])
def decode_certificate_id(certificate):
    try:
        certificate_data = Certificado.query.filter_by(id=certificate).first()
        persona = Personas.query.filter_by(cedula=certificate_data.id_persona).first()
        print(certificate_data.serialize(), persona.serialize())

        cert = 'Certificado'

        namefile = cert + '.pdf'
        namepath = "src/view/certificates/" + namefile
        os.makedirs("src/view/certificates/", exist_ok=True)
        html = render_template('/certificates/certificate.html',
                               base_url=app.config['BASE_URL'],
                               persona=persona.serialize()
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
        response.headers['Content-Disposition'] = 'inline; filename=certificate.pdf'
        response.headers['Content-Type'] = 'application/pdf'

        return response
    except Exception as e:
        return {"error": str(e)}
