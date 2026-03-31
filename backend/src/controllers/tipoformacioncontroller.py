from app import app
from flask import request, jsonify
from decorators import token_required
from datetime import datetime

from src.models.tipoformacionmodel import TipoFormacionModel as TipoFormacion


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

        dataPut = request.json

        tipo_formacion.nombre = dataPut.get('nombre', tipo_formacion.nombre)
        tipo_formacion.descripcion = dataPut.get(
            'descripcion', tipo_formacion.descripcion)
        tipo_formacion.update_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        tipo_formacion.save()

        return jsonify(tipo_formacion.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
