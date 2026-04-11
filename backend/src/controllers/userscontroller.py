from app import app
from flask import request, jsonify, g
from decorators import token_required

from src.services.audit_services import register_audit_action

from src.models.usuariomodel import UsuarioModel as Usuarios
from src.models.rolmodel import RolModel as Roles
from src.models.personasmodel import PersonasModel as Personas


@app.route('/api/users', methods=['GET'])
@token_required
def get_users():
    users = Usuarios.query.order_by(Usuarios.activado.desc()).all()

    dataUsers = []
    for user in users:

        persona = Personas.query.filter_by(cedula=user.id_persona).first()

        rol = Roles.query.filter_by(id=user.id_rol).first()

        user_data = {
            'id': user.id,
            'cedula': user.id_persona,
            'nombres': f"{persona.nombres} {persona.apellidos}",
            'username': user.username,
            'id_rol': user.id_rol,
            'rol': rol.nombre if rol else None,
            'activado': user.activado
        }
        dataUsers.append(user_data)

    return jsonify({'data': dataUsers}), 200


@app.route('/api/users', methods=['POST'])
@token_required
def create_user():
    try:
        data = request.get_json()
        cedula = data.get('cedula')
        persona = Personas.query.filter_by(cedula=cedula).first()
        if not persona:
            new_person = Personas(
                cedula=cedula,
                nac=data.get('nac'),
                nombres=data.get('nombres'),
                apellidos=data.get('apellidos'),
                sexo=data.get('sexo'),
                correo=data.get('correo'),
                fecha_nac=data.get('fecha_nac'))
            new_person.save()

            id_persona = new_person.cedula

            register_audit_action(
                usuario_id=request.current_user['id'],
                ip_address=g.remote_addr,
                tabla='personas',
                accion=1,  # Acción de creación
                valor_old=None,
                valor_new=str(new_person.serialize()),
                col_editada=None
            )
        else:
            id_persona = persona.cedula

        new_user = Usuarios(
            id_persona=id_persona,
            username=data.get('username'),
            password=data.get('password'),
            id_rol=data.get('id_rol'),
            activado=data.get('activado', True)
        )
        new_user.save()
        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='usuarios',
            accion=1,  # Acción de creación
            valor_old=None,
            valor_new=str(new_user.serialize()),
            col_editada=None
        )

        return jsonify({'message': 'Usuario creado exitosamente'}), 201


    except Exception as e:
        return jsonify({'message': 'Error al crear el usuario', 'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    data = request.get_json()

    user = Usuarios.query.get(user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404

    valor_old = str(user.serialize())

    user.username = data.get('username', user.username)
    user.id_rol = data.get('id_rol', user.id_rol)
    user.activado = data.get('activado', user.activado)
    user.save()

    register_audit_action(
        usuario_id=request.current_user['id'],
        ip_address=g.remote_addr,
        tabla='usuarios',
        accion=2,  # Acción de actualización
        valor_old=valor_old,
        valor_new=str(user.serialize()),
        col_editada=None
    )


    return jsonify({'message': 'Usuario actualizado exitosamente'}), 200


@app.route('/api/users/change-pass/<int:user_id>', methods=['PATCH'])
@token_required
def change_password(user_id):
    data = request.get_json()

    new_password = data.get('new_password')

    user = Usuarios.query.get(user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404

    valor_old = str(user.serialize())

    user.password = new_password
    user.save()

    register_audit_action(
        usuario_id=request.current_user['id'],
        ip_address=g.remote_addr,
        tabla='usuarios',
        accion=2,  # Acción de actualización
        valor_old=valor_old,
        valor_new=str(user.serialize()),
        col_editada='password'
    )

    return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
