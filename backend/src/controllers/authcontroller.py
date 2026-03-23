from app import app
from flask import request, jsonify
from decorators import token_required
from src.helpers.jwt import create_jwt, decode_jwt
from src.helpers.password import hash_password

from src.models.usuariomodel import UsuarioModel as Usuarios
from src.models.personasmodel import PersonasModel as Personas


@app.route('/api/login', methods=['POST'])
def login():
    dataPost = request.json

    user = Usuarios.query.filter_by(
        username=dataPost['username'], password=hash_password(dataPost['password'])).first()

    if user is None:
        return jsonify({'error': 'User not found or user and password incorrect'}), 401
    if user.activado == False:
        return jsonify({'error': 'User not activated'}), 401

    if user.activado == True:
        persona = Personas.query.filter_by(cedula=user.id_persona).first()
        token = create_jwt(user)
        user.update({'token': token})

        return jsonify({
            'username': user.username,
            'person': persona.serialize(),
            'rol': user.id_rol,
            'token': f'JWT {token}'
        }), 200

    else:
        return jsonify({'error': 'User not activated'}), 401

@app.route('/api/verifytoken', methods=['POST'])
@token_required
def verify_token():

    dataPost = request.json

    token = dataPost.get("token")

    print(token)

    parts = token.split(' ')

    datos = decode_jwt(parts[1])

    if datos is None:
        return jsonify({'error': 'Invalid token or expired'}), 401

    return jsonify({
        'username': request.current_user.get("username"),
        'rol': request.current_user.get("rol"),
        'isValid': True
    }), 200
