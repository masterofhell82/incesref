from app import app
from flask import request, jsonify
from decorators import token_required
from datetime import datetime



from src.models.cursoactivomodel import CursoActivoModel as CursoActivo
from src.models.cursomodel import CursoModel as Curso
from src.models.preimpresomodel import PreImpresoModel as PreImpreso

from src.services.audit_services import register_audit_action

'''
Se registran los cursos activos, es decir, aquellos que fueron dictados en un periodo determinado. Además, se pueden asociar a una entidad de trabajo y a un preimpreso específico para cada curso activo.
'''
@app.route('/api/curso_activo/register', methods=['POST'])
@token_required
def register_curso_activo():
    try:
        dataPost = request.json

        curso = Curso.query.filter_by(shortname=dataPost.get('shortname')).first()

        curso_activo = CursoActivo(
            id_curso=curso.id,
            id_cfs=dataPost.get('id_cfs'),
            cant_participan=25,
            cant_grupo=1,
            activo=False,
            entidad_trabajo_id=dataPost.get('entidad_trabajo_id') if dataPost.get('entidad_trabajo_id') else 0,
            fecha_inicio=dataPost.get('fecha_inicio'),
            fecha_fin=dataPost.get('fecha_fin'),
        )

        curso_activo.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='curso_activo',
            accion=1,  # Acción de creación
            valor_old={},
            valor_new=curso_activo.serialize(),
        )

        preimpreso = PreImpreso.query.filter_by(id=dataPost.get('preimpreso_id')).first()

        if preimpreso:
            preimpreso.curso_activo_id = curso_activo.id
            preimpreso.save()

        return jsonify({'data': curso_activo.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400
