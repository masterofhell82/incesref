from app import app
from flask import request, jsonify
from decorators import token_required
from datetime import datetime

from src.models.entidadtrabajomodel import EntidadTrabajo as EntidadTrabajoModel


@app.route('/api/entidad_trabajo', methods=['POST'])
@token_required
def create_entidad_trabajo():
    try:
        dataPost = request.json

        entidad_trabajo = EntidadTrabajoModel(
            rif=dataPost.get('rif'),
            nombre=dataPost.get('nombre'),
            direccion=dataPost.get('direccion'),
            estado_id=dataPost.get('estado_id'),
            estatus=dataPost.get('estatus', True)
        )

        entidad_trabajo.save()

        return jsonify({'data': entidad_trabajo.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/entidad_trabajo', methods=['GET'])
@token_required
def get_entidad_trabajo():
    try:
        entidad_trabajo_list = EntidadTrabajoModel.query.order_by(
            EntidadTrabajoModel.id.asc()).all()
        return jsonify({'data': [e.serialize() for e in entidad_trabajo_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/entidad_trabajo/state/<int:estado_id>', methods=['GET'])
@token_required
def get_entidad_trabajo_by_state(estado_id):
    try:
        entidad_trabajo_list = EntidadTrabajoModel.query.filter_by(estado_id=estado_id).order_by(
            EntidadTrabajoModel.id.asc()).all()
        return jsonify({'data': [e.serialize() for e in entidad_trabajo_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/entidad_trabajo/<int:id>', methods=['PUT'])
@token_required
def update_entidad_trabajo(id):
    try:
        entidad_trabajo = EntidadTrabajoModel.query.get(id)
        if not entidad_trabajo:
            return jsonify({'error': 'Entidad de Trabajo no encontrada'}), 404

        dataPut = request.json

        entidad_trabajo.rif = dataPut.get('rif', entidad_trabajo.rif)
        entidad_trabajo.nombre = dataPut.get('nombre', entidad_trabajo.nombre)
        entidad_trabajo.direccion = dataPut.get(
            'direccion', entidad_trabajo.direccion)
        entidad_trabajo.estado_id = dataPut.get(
            'estado_id', entidad_trabajo.estado_id)
        entidad_trabajo.estatus = dataPut.get(
            'estatus', entidad_trabajo.estatus)
        entidad_trabajo.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        entidad_trabajo.save()

        return jsonify(entidad_trabajo.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
