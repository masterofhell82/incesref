from app import app
from decorators import token_required
from flask import g, jsonify, request

# modeles
from src.models.personasmodel import PersonasModel as Personas
from src.services.audit_services import register_audit_action


@app.route('/api/person/<id_person>', methods=['GET'])
def get_person(id_person):
    try:
        person = Personas.query.filter_by(cedula=id_person).first()
        if person:
            return jsonify({"data": person.serialize()}), 200
        return jsonify({"message": "Person not found", "code": "PNF001"}), 404
    except Exception as e:
        return jsonify({'message': str(e), 'code': 'ERR001'}), 500


@app.route('/api/person', methods=['POST'])
@token_required
def create_person():
    try:
        data = request.get_json()
        cedula = data.get('cedula')
        existing_person = Personas.query.filter_by(cedula=cedula).first()

        if existing_person:
            return jsonify({"message": "Person already exists"}), 400

        new_person = Personas(
            cedula=cedula,
            nac=data.get('nac'),
            nombres=data.get('nombres'),
            apellidos=data.get('apellidos'),
            telefono=data.get('telefono'),
            correo=data.get('correo'),
            sexo=data.get('sexo'),
            fecha_nace=data.get('fechaNace')
        )
        new_person.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='personas',
            accion=1,  # Acción de creación
            valor_old=None,
            valor_new=str(new_person.serialize()),
            col_editada=None
        )

        return jsonify({"data": new_person.serialize()}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/person/<id_person>', methods=['PUT'])
@token_required
def update_person(id_person):
    try:
        person = Personas.query.filter_by(cedula=id_person).first()
        if not person:
            return jsonify({"message": "Person not found"}), 404

        data = request.get_json()
        old_data = person.serialize()

        data_to_update = {
            'nac': data.get('nac', person.nac),
            'nombres': data.get('nombres', person.nombres),
            'apellidos': data.get('apellidos', person.apellidos),
            'telefono': data.get('telefono', person.telefono),
            'correo': data.get('correo', person.correo),
            'sexo': data.get('sexo', person.sexo),
            'fecha_nace': data.get('fechaNace', person.fecha_nace)
        }

        person.update(data_to_update)

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='personas',
            accion=2,  # Acción de actualización
            valor_old=str(old_data),
            valor_new=str(person.serialize()),
            col_editada=None
        )

        return jsonify({"data": person.serialize()}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500
