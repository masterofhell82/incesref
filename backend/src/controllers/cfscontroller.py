from app import app, db
from flask import request, jsonify
from decorators import token_required
from werkzeug.utils import secure_filename
import os
import uuid
import csv
from datetime import datetime

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


@app.route('/api/cfs/masive', methods=['POST'])
@token_required
def create_cfs_masive():
    saved_path = None
    try:
        uploaded_file = request.files.get('file')

        upload_dir = os.path.join(app.root_path, 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        safe_name = secure_filename(uploaded_file.filename)
        unique_name = f"{uuid.uuid4().hex}_{safe_name}"
        saved_path = os.path.join(upload_dir, unique_name)
        uploaded_file.save(saved_path)

        def parse_int_column(row, column, line):
            raw_value = (row.get(column) or '').strip()
            try:
                return int(raw_value)
            except (TypeError, ValueError):
                raise ValueError(f'Valor inválido en la línea {line}, columna {column}')

        cfs_list = []
        with open(saved_path, mode='r', encoding='utf-8-sig', newline='') as csv_file:
            reader = csv.DictReader(csv_file)

            for index, row in enumerate(reader, start=2):
                if not any((value or '').strip() for value in row.values()):
                    continue
                try:
                    cfs = CFS(
                        id_estado=parse_int_column(row, 'id_estado', index),
                        id_municipios=parse_int_column(row, 'id_municipios', index),
                        id_parroquias=parse_int_column(row, 'id_parroquias', index),
                        codigo=(row.get('codigo') or '').strip(),
                        nombre=(row.get('nombre') or '').strip(),
                        direccion=(row.get('direccion') or '').strip() or None,
                        id_ambito=parse_int_column(row, 'id_ambito', index)
                    )
                    cfs_list.append(cfs)
                except ValueError as parse_error:
                    return jsonify({'error': str(parse_error)}), 400

        if not cfs_list:
            return jsonify({'error': 'El archivo no contiene filas válidas para procesar'}), 400

        db.session.begin()
        db.session.add_all(cfs_list)
        db.session.commit()

        return jsonify({
            'message': 'Archivo procesado y CFS creados masivamente',
            'filename': unique_name,
            'inserted': len(cfs_list),
            'path': f"static/uploads/{unique_name}"
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        if saved_path and os.path.exists(saved_path):
            try:
                os.remove(saved_path)
            except OSError as file_error:
                app.logger.warning(f'No se pudo eliminar el archivo temporal {saved_path}: {file_error}')


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


@app.route('/api/cfs/<int:id>', methods=['PUT'])
@token_required
def update_cfs(id):
    try:
        cfs = CFS.query.get(id)
        if not cfs:
            return jsonify({'error': 'CFS no encontrado'}), 404

        dataPut = request.json

        cfs.id_estado = dataPut.get('id_estado', cfs.id_estado)
        cfs.id_municipios = dataPut.get('id_municipios', cfs.id_municipios)
        cfs.id_parroquias = dataPut.get('id_parroquias', cfs.id_parroquias)
        cfs.codigo = dataPut.get('codigo', cfs.codigo)
        cfs.nombre = dataPut.get('nombre', cfs.nombre)
        cfs.direccion = dataPut.get('direccion', cfs.direccion)
        cfs.id_ambito = dataPut.get('id_ambito', cfs.id_ambito)
        cfs.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cfs.save()

        return jsonify(cfs.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
