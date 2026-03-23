from app import app
from flask import jsonify, render_template, make_response, send_file, request
import os
import io
from decorators import token_required, verify_token
import base64
import pdfkit

# Models
from src.models.certificadomodel import CertificadoModel as Certificado
from src.models.tipoformacionmodel import TipoFormacionModel as TipoFormacion
from src.models.personasmodel import PersonasModel as Personas
from src.models.preimpresomodel import PreImpresoModel as PreImpreso
from src.models.vigenciacertificadosmodels import VigenciaCertificadosModel as VigenciaCertificados
from src.models.vw_curso_publicado import VwCursoPublicado as VwCursoPublicado


@app.route('/api/currentcertificates', methods=['GET'])
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


@app.route('/api/getcertificates/<preimpress>', methods=['GET'])
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

            course = VwCursoPublicado.query.filter_by(
                id_cur_activo=cert.id_curso_activo).first()
            concat_str = f"{cert.id}-{course.id_curso if course else ''}-{course.id_cur_activo if course else ''}-{cert.id_persona}-{course.estado if course else ''}"
            id_certificate = base64.b64encode(
                concat_str.encode('utf-8')).decode('utf-8')
            data.append({
                "cedula": persona.cedula if persona else None,
                "nombres": persona.nombres if persona else None,
                "apellidos": persona.apellidos if persona else None,
                "idCertificate": id_certificate,
                "course": course.curso if course else None,
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
            concat_str = f"{cert.id}-{course.id_curso if course else ''}-{course.id_cur_activo if course else ''}-{id_person}-{course.estado if course else ''}"
            id_certificate = base64.b64encode(
                concat_str.encode('utf-8')).decode('utf-8')
            data.append({
                "idCertificate": id_certificate,
                "course": course.curso if course else None
            })

        return jsonify({"data": data}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/viewcertificate/<certificate>', methods=['GET'])
def decode_certificate_id(certificate):
    try:
        decoded_bytes = base64.b64decode(certificate)
        decoded_str = decoded_bytes.decode('utf-8')
        id_certificado, id_curso, id_cur_activo, id_persona, estado = decoded_str.split('-')

        cert = 'Certificado'
        namefile = cert + '.pdf'
        namepath = "src/view/certificates/" + namefile
        os.makedirs("src/view/certificates/", exist_ok=True)
        html = render_template('/certificates/certificate.html',
                               base_url=app.config['BASE_URL'],
                               )
        # Configuración de pdfkit para orientación horizontal
        options = {
            'page-size': 'A4',
            'orientation': 'Landscape',
            'encoding': 'UTF-8',
            'no-outline': None,
            'quiet': ''
        }
        pdfkit.from_string(html, namepath, options=options)
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
