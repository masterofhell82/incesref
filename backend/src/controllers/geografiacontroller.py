from app import app
from flask import request, jsonify

from src.models.geografiamodel import EstadosModel as Estados, CiudadesModel as Ciudad, MunicipiosModel as Municipios, ParroquiasModel as Parroquias


@app.route('/api/estados', methods=['GET'])
def get_estados():
    try:
        estados_list = Estados.query.all()
        return jsonify([estado.serialize() for estado in estados_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ciudades', methods=['GET'])
def get_ciudades():
    try:
        ciudades_list = Ciudad.query.all()
        return jsonify([ciudad.serialize() for ciudad in ciudades_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/municipios', methods=['GET'])
def get_municipios():
    try:
        municipios_list = Municipios.query.all()
        return jsonify([municipio.serialize() for municipio in municipios_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/parroquias', methods=['GET'])
def get_parroquias():
    try:
        parroquias_list = Parroquias.query.all()
        return jsonify([parroquia.serialize() for parroquia in parroquias_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
