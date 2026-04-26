from app import app, db
from flask import request, jsonify
from decorators import token_required
from werkzeug.utils import secure_filename
import os
import uuid
import csv

from src.models.tipoformacionmodel import TipoFormacionModel as TipoFormacion
from src.models.programamodel import ProgramaModel as Programa
from src.models.cursomodel import CursoModel as Curso
from src.models.cursoscontenidomodel import CursoContenidoModel as CursoContenido

from src.services.audit_services import register_audit_action


@app.route('/api/cursos', methods=['POST'])
@token_required
def create_curso():
    try:
        dataPost = request.json

        curso = Curso(
            nombre=dataPost.get('nombre'),
            descripcion=dataPost.get('descripcion'),
            max_participan=dataPost.get('maxParticipan', 25),
            id_programa=dataPost.get('programaId'),
            shortname=dataPost.get('shortname'),
            tipo_formacion=dataPost.get('tipoFormacionId')
        )

        curso.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='curso',
            accion=1,  # Acción de creación
            valor_old={},
            valor_new=curso.serialize(),
        )

        return jsonify({'data': curso.serialize()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/cursos/masive', methods=['POST'])
@token_required
def create_curso_masive():
    saved_path = None
    try:
        uploaded_file = request.files.get('file')
        if not uploaded_file or not uploaded_file.filename:
            return jsonify({'error': 'Debe enviar un archivo CSV en el campo file'}), 400

        if not uploaded_file.filename.lower().endswith('.csv'):
            return jsonify({'error': 'El archivo debe tener extensión .csv'}), 400

        upload_dir = os.path.join(app.root_path, 'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        safe_name = secure_filename(uploaded_file.filename)
        unique_name = f"{uuid.uuid4().hex}_{safe_name}"
        saved_path = os.path.join(upload_dir, unique_name)
        uploaded_file.save(saved_path)

        required_columns = {'nombre', 'descripcion',
                            'shortname', 'tipo_formacion', 'id_programa'}

        def parse_int_column(row, column, line):
            raw_value = (row.get(column) or '').strip()
            try:
                return int(raw_value)
            except (TypeError, ValueError):
                raise ValueError(
                    f'Valor inválido en la línea {line}, columna {column}')

        cursos = []
        with open(saved_path, mode='r', encoding='utf-8-sig', newline='') as csv_file:
            reader = csv.DictReader(csv_file)

            if not reader.fieldnames:
                return jsonify({'error': 'El archivo CSV no contiene cabeceras'}), 400

            missing_columns = required_columns - set(reader.fieldnames)
            if missing_columns:
                return jsonify({'error': f'Faltan columnas requeridas: {", ".join(sorted(missing_columns))}'}), 400

            for index, row in enumerate(reader, start=2):
                if not any((value or '').strip() for value in row.values()):
                    continue

                nombre = (row.get('nombre') or '').strip()
                descripcion = (row.get('descripcion') or '').strip()
                shortname = (row.get('shortname') or '').strip()

                if not nombre or not descripcion or not shortname:
                    return jsonify({'error': f'Campos requeridos vacíos en la línea {index}'}), 400

                tipo_formacion_id = parse_int_column(
                    row, 'tipo_formacion', index)
                id_programa = parse_int_column(row, 'id_programa', index)

                max_participan = 25
                if 'max_participan' in row and (row.get('max_participan') or '').strip():
                    max_participan = parse_int_column(
                        row, 'max_participan', index)

                curso = Curso(
                    nombre=nombre,
                    descripcion=descripcion,
                    max_participan=max_participan,
                    id_programa=id_programa,
                    shortname=shortname,
                    tipo_formacion=tipo_formacion_id
                )
                cursos.append(curso)

        if not cursos:
            return jsonify({'error': 'El archivo no contiene filas válidas para procesar'}), 400

        db.session.begin()
        db.session.add_all(cursos)
        db.session.commit()

        return jsonify({'data': [curso.serialize() for curso in cursos], 'inserted': len(cursos)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        if saved_path and os.path.exists(saved_path):
            try:
                os.remove(saved_path)
            except OSError as file_error:
                app.logger.warning(
                    f'No se pudo eliminar el archivo temporal {saved_path}: {file_error}')


@app.route('/api/cursos', methods=['GET'])
@token_required
def get_curso():
    try:
        curso_list = Curso.query.order_by(Curso.id.asc()).all()

        courses_data = []

        for curso in curso_list:
            tipo_formacion = TipoFormacion.query.get(curso.tipo_formacion)
            programa = Programa.query.get(curso.id_programa)
            curso_data = curso.serialize()
            curso_data['is_contenido'] = bool(CursoContenido.query.filter_by(
                shortname_curso=curso.shortname).first())
            curso_data['tipo'] = tipo_formacion.nombre if tipo_formacion else None
            curso_data['programa'] = programa.nombre if programa else None
            courses_data.append(curso_data)

        return jsonify({'data': courses_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/cursos/<int:id>', methods=['PUT'])
@token_required
def update_curso(id):
    try:
        dataPost = request.json
        curso = Curso.query.get(id)
        if not curso:
            return jsonify({'error': 'Curso no encontrado'}), 404

        valor_old = curso.serialize()

        curso.update({
            'nombre': dataPost.get('nombre', curso.nombre),
            'descripcion': dataPost.get('descripcion', curso.descripcion),
            'max_participan': dataPost.get('maxParticipan', curso.max_participan),
            'id_programa': dataPost.get('programaId', curso.id_programa),
            'shortname': dataPost.get('shortname', curso.shortname),
            'tipo_formacion': dataPost.get('tipoFormacionId', curso.tipo_formacion)
        })

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='curso',
            accion=2,  # Acción de actualización
            valor_old=valor_old,
            valor_new=curso.serialize(),
        )

        return jsonify({'data': curso.serialize()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/cursos/validate-shortname/<string:shortname>', methods=['GET'])
@token_required
def validate_shortname(shortname):
    try:
        exists = Curso.query.filter_by(shortname=shortname).first() is not None
        return jsonify({'exists': exists}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
