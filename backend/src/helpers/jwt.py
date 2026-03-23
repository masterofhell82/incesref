from app import app
import jwt
from datetime import datetime, timedelta, timezone

def create_jwt(user):
    clave_secreta = app.config['SECRET_KEY']
    datos = {
        'id': user.id,
        'username': user.username,
        'rol': user.id_rol,
        'system': 'streams',
        "exp": datetime.now(timezone.utc) + timedelta(seconds=7200) if user.username == 'guess' else datetime.now(timezone.utc) + timedelta(seconds=7200)
    }

    token = jwt.encode(datos, clave_secreta, algorithm="HS256")
    return token

def decode_jwt(token):
    clave_secreta = app.config['SECRET_KEY']
    try:
        datos = jwt.decode(token, clave_secreta, algorithms=["HS256"])
        return datos
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
