from app import app
from flask import jsonify

from src.models.preimpresomodel import PreImpresoModel as Preimpreso

@app.route('/api/preimpreso/<preimpreso>', methods=['GET'])
def get_preimpreso(preimpreso):
    try:
        preimpreso_data = Preimpreso.query.filter_by(preimpreso=preimpreso).first()
        if preimpreso_data:
            data = preimpreso_data.serialize()
            data["isValid"] = True
            return jsonify({"data": data}), 200
        return jsonify({"message": "Preimpreso not found", "code": "PNF002"}), 404
    except Exception as e:
        return jsonify({'message': str(e), 'code': 'ERR002'}), 500
