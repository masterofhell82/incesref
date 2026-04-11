from app import app
from flask import request, jsonify, g
from decorators import token_required
from datetime import datetime

from src.models.rolmodel import RolModel as Rol

from src.services.audit_services import register_audit_action


@app.route('/api/roles', methods=['POST'])
@token_required
def create_rol():
    try:
        dataPost = request.json or {}

        # Obtener el último ID registrado en la tabla de roles
        last_rol = Rol.query.order_by(Rol.id.desc()).first()
        new_id = last_rol.id + 1 if last_rol else 1

        # Permitir id explícito solo si es válido; evitar que null/vacío sobrescriba el id calculado
        provided_id = dataPost.get('id')
        if provided_id not in (None, ''):
            new_id = int(provided_id)

        rol = Rol(
            id=new_id,
            nombre=dataPost.get('nombre'),
            descripcion=dataPost.get('descripcion')
        )

        rol.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='roles',
            accion=1,  # Acción de creación
            valor_old={},
            valor_new=rol.serialize(),
        )

        return jsonify({'data': rol.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/roles', methods=['GET'])
@token_required
def get_rol():
    try:
        rol_list = Rol.query.order_by(Rol.id.asc()).all()
        return jsonify({'data': [r.serialize() for r in rol_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/roles/<int:id>', methods=['PUT'])
@token_required
def update_rol(id):
    try:
        rol = Rol.query.get(id)

        valor_old = str(rol.serialize())

        if not rol:
            return jsonify({'error': 'Rol no encontrado'}), 404

        dataPut = request.json

        rol.nombre = dataPut.get('nombre', rol.nombre)
        rol.descripcion = dataPut.get('descripcion', rol.descripcion)
        rol.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        rol.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='roles',
            accion=2,  # Acción de actualización
            valor_old=valor_old,
            valor_new=str(rol.serialize()),
        )

        return jsonify(rol.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
