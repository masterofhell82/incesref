from app import app
from flask import request, jsonify
from decorators import token_required


from src.models.programamodel import ProgramaModel as Programa

from src.services.audit_services import register_audit_action


@app.route('/api/programas', methods=['POST'])
@token_required
def create_programa():
    try:
        dataPost = request.json

        programa = Programa(
            nombre=dataPost.get('nombre'),
            descripcion=dataPost.get('descripcion'),
            is_activo=dataPost.get('isActivo', True)
        )

        programa.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='programas',
            accion=1,  # Acción de creación
            valor_old={},
            valor_new=str(programa.serialize()),
        )

        return jsonify({'data': programa.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/programas', methods=['GET'])
@token_required
def get_programas():
    try:
        programas = Programa.query.order_by(Programa.id).all()
        return jsonify({'data': [p.serialize() for p in programas]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/programas/<int:id>', methods=['PUT'])
@token_required
def update_programa(id):
    try:
        dataPost = request.json
        programa = Programa.query.get(id)
        if not programa:
            return jsonify({'error': 'Programa no encontrado'}), 404

        valor_old = str(programa.serialize())

        programa.update({
            'nombre': dataPost.get('nombre'),
            'descripcion': dataPost.get('descripcion'),
            'is_activo': dataPost.get('isActivo', programa.is_activo)
        })

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='programas',
            accion=2,  # Acción de actualización
            valor_old=valor_old,
            valor_new=str(programa.serialize()),
        )

        return jsonify({'data': programa.serialize()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/programas/activate/<int:id>', methods=['PATCH'])
@token_required
def activate_programa(id):
    try:
        programa = Programa.query.get(id)
        if not programa:
            return jsonify({'error': 'Programa no encontrado'}), 404

        valor_old = str(programa.serialize())

        programa.update({
            'is_activo': not programa.is_activo
        })

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='programas',
            accion=4,  # Acción de activación/desactivación
            valor_old=valor_old,
            valor_new=str(programa.serialize()),
        )

        return jsonify({'data': programa.serialize()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
