from app import app
from flask import request, jsonify

from src.models.geografiamodel import EstadosModel as Estados, CiudadesModel as Ciudad, MunicipiosModel as Municipios, ParroquiasModel as Parroquias


@app.route('/api/estados', methods=['GET'])
def get_estados():
    try:
        estados_list = Estados.query.all()
        return jsonify({'data': [estado.serialize() for estado in estados_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ciudades/<estado_id>', methods=['GET'])
def get_ciudades(estado_id):
    try:
        if estado_id == 0 or estado_id is None:
            ciudades_list = Ciudad.query.all()
        else:
            ciudades_list = Ciudad.query.filter_by(estado_id=estado_id).all()
        return jsonify({'data': [ciudad.serialize() for ciudad in ciudades_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/municipios/<id_estado>', methods=['GET'])
def get_municipios(id_estado):
    try:
        if id_estado == 0 or id_estado is None:
            municipios_list = Municipios.query.all()
        else:
            municipios_list = Municipios.query.filter_by(id_estado=id_estado).all()
        return jsonify({'data': [municipio.serialize() for municipio in municipios_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/parroquias/<int:id_municipio>', methods=['GET'])
def get_parroquias(id_municipio):
    try:
        if id_municipio == 0 or id_municipio is None:
            parroquias_list = Parroquias.query.all()
        else:
            parroquias_list = Parroquias.query.filter_by(id_municipio=id_municipio).all()
        return jsonify({'data': [parroquia.serialize() for parroquia in parroquias_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
