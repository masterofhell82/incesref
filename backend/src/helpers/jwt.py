import uuid
from datetime import datetime, timedelta, timezone

import jwt
from app import app

TZ = timezone(timedelta(hours=-4))

def create_jwt(user):
    clave_secreta = app.config['SECRET_KEY']
    jti = str(uuid.uuid4())
    exp = datetime.now(TZ) + timedelta(seconds=7200)

    datos = {
        'id': user.id,
        'username': user.username,
        'rol': user.id_rol,
        "jti": jti,
        "exp": int(exp.timestamp()),
    }

    token = jwt.encode(datos, clave_secreta, algorithm="HS256")
    return token, jti, exp

def decode_jwt(token):
    clave_secreta = app.config['SECRET_KEY']
    try:
        datos = jwt.decode(token, clave_secreta, algorithms=["HS256"])
        return datos
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
