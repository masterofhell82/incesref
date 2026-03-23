from app import app
from flask import jsonify

from src.models.personasmodel import PersonasModel as Personas

@app.route('/api/person/<id_person>', methods=['GET'])
def get_person(id_person):
    try:
        person = Personas.query.filter_by(cedula=id_person).first()
        if person:
            return jsonify({"data": person.serialize()}), 200
        return jsonify({"message": "Person not found", "code": "PNF001"}), 404
    except Exception as e:
        return jsonify({'message': str(e), 'code': 'ERR001'}), 500
