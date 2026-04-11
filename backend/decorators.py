from app import app
from flask import jsonify, request, g
from functools import wraps
import jwt
import platform


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            # Obtener el token del encabezado
            token = request.headers.get('Authorization', None)

            if not token:
                return jsonify({'message': 'Token is missing'}), 403

            parts = token.split(' ')

            if parts[0] != 'JWT' or len(parts) != 2:
                return jsonify({'message': 'Token format is invalid'}), 403

            token = parts[1]
            if not token:
                return jsonify({'message': 'Token is empty'}), 403

            result = verify_token(token)

            if 'error' in result:
                return jsonify({'error': result['error']}), result['status_code']

            if isinstance(result, dict):
                g.user_agent = request.headers.get('User-Agent', 'Unknown')
                g.remote_addr = request.remote_addr
                g.platform = platform.system()
                request.current_user = result

            return f(*args, **kwargs)

        except Exception as e:
            return jsonify({'error': f'Token is invalid: {str(e)}'}), 403

    return decorated


def verify_token(token):
    try:
        data = jwt.decode(
            token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return data
    except jwt.ExpiredSignatureError:
        return {'error': 'Expired token, please login', 'status_code': 401}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token', 'status_code': 401}
