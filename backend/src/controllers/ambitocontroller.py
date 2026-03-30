from app import app
from flask import request, jsonify
from decorators import token_required

from src.models.ambitosmodel import AmbitosModel as Ambitos


@app.route('/api/ambitos', methods=['POST'])
@token_required
def create_ambito():
    try:
        dataPost = request.json

        ambito = Ambitos(
            nombre=dataPost.get('nombre'),
            descripcion=dataPost.get('descripcion'),
            shortname=dataPost.get('shortname')
        )

        ambito.save()

        return jsonify({'data': ambito.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ambitos', methods=['GET'])
@token_required
def get_ambitos():
    try:
        ambitos_list = Ambitos.query.order_by(Ambitos.id.asc()).all()
        return jsonify({'data': [a.serialize() for a in ambitos_list]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
