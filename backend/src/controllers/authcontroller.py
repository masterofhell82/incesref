import hashlib
from datetime import datetime, timedelta, timezone

from app import app, db
from decorators import token_required
from flask import jsonify, request

TZ = timezone(timedelta(hours=-4))

# helpers
from src.helpers.jwt import create_jwt, decode_jwt
from src.helpers.password import hash_password

# models
from src.models.personasmodel import PersonasModel as Personas
from src.models.usersessionsmodel import UserSessionModel as UserSessions
from src.models.usuariomodel import UsuarioModel as Usuarios


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
        token, jti, exp = create_jwt(user)

        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        if ip and ',' in ip:
            ip = ip.split(',')[0].strip()

        session = UserSessions(
            user_id=user.id,
            jti=jti,
            token_hash=hashlib.sha256(token.encode()).hexdigest(),
            ip_address=ip,
            user_agent=request.headers.get('User-Agent'),
            expires_at=exp
        )
        session.save()

        # Update the user object with the token
        user.update({'token': token})

        return jsonify({
            'jti': jti,
            'userId': user.id,
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
    try:
        dataPost = request.json
        token = dataPost.get("token")

        parts = token.split(' ')

        datos = decode_jwt(parts[1])
        if datos is None:
            return jsonify({'error': 'API - Invalid token or expired'}), 401

        session = UserSessions.query.filter_by(
            user_id=datos.get('id'),
            jti=datos.get('jti')
        ).first()

        now_dt = datetime.now(TZ)
        if session is None or session.revoked_at is not None or int(session.expires_at.timestamp()) < int(now_dt.timestamp()):
            return jsonify({'error': 'API -Session not active'}), 401

        session.last_seen_at = now_dt.strftime('%Y-%m-%d %H:%M:%S')
        db.session.commit()

        return jsonify({
            'username': request.current_user.get("username"),
            'rol': request.current_user.get("rol"),
            'isValid': True
        }), 200

    except Exception as e:
        return jsonify({'error': str(f"API - {e}")}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    dataPost = request.json
    token = dataPost.get("token")

    parts = token.split(' ')

    datos = decode_jwt(parts[1])

    session = UserSessions.query.filter_by(
        user_id=datos.get('id'),
        jti=datos.get('jti'),
        revoked_at=None
    ).first()

    if session:
        session.revoked_at = datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S')
        session.revoke_reason = dataPost.get("reason", "logout")
        db.session.commit()

    return jsonify({'message': 'Logout successful'}), 200
