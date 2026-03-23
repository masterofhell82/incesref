from app import app
from flask import request, jsonify
from decorators import token_required

from src.models.cfsmodel import CFSModel as CFS
from src.models.geografiamodel import EstadosModel as Estados
from src.models.ambitosmodel import AmbitosModel as Ambitos

@app.route('/api/cfs', methods=['POST'])
@token_required
def create_cfs():
    try:
        dataPost = request.json

        cfs = CFS(
            id_estado=dataPost['id_estado'],
            id_municipios=dataPost['id_municipios'],
            id_parroquias=dataPost['id_parroquias'],
            codigo=dataPost['codigo'],
            nombre=dataPost['nombre'],
            direccion=dataPost.get('direccion'),
            id_ambito=dataPost.get('id_ambito')
        )

        cfs.save()

        return jsonify(cfs.serialize()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/cfs', methods=['GET'])
@token_required
def get_cfs():
    try:
        cfs_list = CFS.query.order_by(CFS.id.asc()).all()
        cfs_result = []
        for c in cfs_list:
            estado = Estados.query.get(c.id_estado)
            ambito = Ambitos.query.get(c.id_ambito)
            cfs_data = c.serialize()
            cfs_data['estado'] = estado.estado
            cfs_data['ambito'] = ambito.nombre
            cfs_result.append(cfs_data)
        return jsonify({'data': cfs_result}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
