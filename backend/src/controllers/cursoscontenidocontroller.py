from app import app
from flask import request, jsonify
from decorators import token_required

from src.models.cursoscontenidomodel import CursoContenidoModel as CursoContenido

from src.services.audit_services import register_audit_action


@app.route('/api/cursos/contenido', methods=['POST'])
@token_required
def create_curso_contenido():
    try:
        dataPost = request.json

        curso_contenido = CursoContenido(
            shortname_curso=dataPost.get('shortnameCurso'),
            contenido=dataPost.get('contenido'),
            horas=dataPost.get('horas')
        )

        curso_contenido.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='contenido_curso',
            accion=1,  # Acción de creación
            valor_old={},
            valor_new=curso_contenido.serialize(),
        )

        return jsonify({'data': curso_contenido.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/cursos/contenido/<string:shortname>', methods=['GET'])
@token_required
def get_curso_contenido(shortname):
    try:
        curso_contenido = CursoContenido.query.filter_by(
            shortname_curso=shortname).order_by(CursoContenido.id.asc()).all()
        if not curso_contenido:
            return jsonify({'error': 'Contenido del curso no encontrado'}), 404

        return jsonify({'data': [c.serialize() for c in curso_contenido]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/cursos/contenido/<int:id>', methods=['PUT'])
@token_required
def update_curso_contenido(id):
    try:
        dataPost = request.json
        curso_contenido = CursoContenido.query.get(id)

        valor_old = curso_contenido.serialize() if curso_contenido else {}

        if not curso_contenido:
            return jsonify({'error': 'Contenido del curso no encontrado'}), 404

        curso_contenido.update({
            'shortname_curso': dataPost.get('shortnameCurso', curso_contenido.shortname_curso),
            'contenido': dataPost.get('contenido', curso_contenido.contenido),
            'horas': dataPost.get('horas', curso_contenido.horas)
        })

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='contenido_curso',
            accion=2,  # Acción de actualización
            valor_old=valor_old,
            valor_new=curso_contenido.serialize(),
        )

        return jsonify({'data': curso_contenido.serialize()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/cursos/contenido/<int:id>', methods=['DELETE'])
@token_required
def delete_curso_contenido(id):
    try:
        curso_contenido = CursoContenido.query.get(id)

        if not curso_contenido:
            return jsonify({'error': 'Contenido del curso no encontrado'}), 404

        valor_old = curso_contenido.serialize()

        curso_contenido.delete()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='contenido_curso',
            accion=3,  # Acción de eliminación
            valor_old=valor_old,
            valor_new={},
        )

        return jsonify({'message': 'Contenido del curso eliminado exitosamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
