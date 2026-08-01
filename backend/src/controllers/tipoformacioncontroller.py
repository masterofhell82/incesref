from datetime import datetime, timezone

from app import app
from decorators import token_required
from flask import g, jsonify, request

# models
from src.models.tipoformacionmodel import TipoFormacionModel as TipoFormacion

# services
from src.services.audit_services import register_audit_action


@app.route('/api/tipoformacion', methods=['POST'])
@token_required
def create_tipo_formacion():
    try:
        dataPost = request.json

        tipo_formacion = TipoFormacion(
            nombre=dataPost.get('nombre'),
            descripcion=dataPost.get('descripcion')
        )

        tipo_formacion.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='tipo_formacion',
            accion=1,  # Acción de creación
            valor_old=None,
            valor_new=str(tipo_formacion.serialize()),
            col_editada=None
        )

        return jsonify({'data': tipo_formacion.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/tipoformacion', methods=['GET'])
@token_required
def get_tipo_formacion():
    try:
        tipo_formacion_list = TipoFormacion.query.order_by(
            TipoFormacion.id.asc()).all()
        return jsonify({'data': [tf.serialize() for tf in tipo_formacion_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/tipoformacion/<int:id>', methods=['PUT'])
@token_required
def update_tipo_formacion(id):
    try:
        tipo_formacion = TipoFormacion.query.get(id)
        if not tipo_formacion:
            return jsonify({'error': 'Tipo de Formación no encontrado'}), 404

        valor_old = str(tipo_formacion.serialize())

        dataPut = request.json

        tipo_formacion.nombre = dataPut.get('nombre', tipo_formacion.nombre)
        tipo_formacion.descripcion = dataPut.get(
            'descripcion', tipo_formacion.descripcion)
        tipo_formacion.update_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

        tipo_formacion.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='tipo_formacion',
            accion=2,  # Acción de actualización
            valor_old=valor_old,
            valor_new=str(tipo_formacion.serialize()),
            col_editada=None
        )

        return jsonify(tipo_formacion.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
