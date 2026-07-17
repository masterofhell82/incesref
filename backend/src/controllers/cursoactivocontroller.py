from app import app, db
from flask import request, jsonify
from decorators import token_required
import re
 
from src.models.cfsmodel import CFSModel as CFS
from src.models.geografiamodel import EstadosModel as Estados
from src.models.cursoactivomodel import CursoActivoModel as CursoActivo
from src.models.cursomodel import CursoModel as Curso
from src.models.preimpresomodel import PreImpresoModel as PreImpreso
from src.models.auditoriamodel import AuditoriaModel as Auditoria
from src.helpers.date_parser import parse_date

'''
Se registran los cursos activos, es decir, aquellos que fueron dictados en un periodo determinado. Además, se pueden asociar a una entidad de trabajo y a un preimpreso específico para cada curso activo.
'''
@app.route('/api/curso_activo/register', methods=['POST'])
@token_required
def register_curso_activo():
    try:
        dataPost = request.json

        fecha_inicio = parse_date(dataPost.get('fecha_inicio'), 'fecha_inicio')
        fecha_fin = parse_date(dataPost.get('fecha_fin'), 'fecha_fin')
        
        curso = Curso.query.filter_by(shortname=dataPost.get('shortname')).first()

        estado_abreviatura = (
            db.session.query(Estados.abreviatura)
            .join(CFS, CFS.id_estado == Estados.id)
            .filter(CFS.id == dataPost.get('id_cfs'))
            .scalar()
        )
        if not estado_abreviatura:
            return jsonify({'error': 'No existe estado asociado al CFS indicado'}), 404
        
        if not curso:
            return jsonify({'error': 'No existe un curso con el shortname indicado'}), 404

        curso_activo = CursoActivo(
            id_curso=curso.id,
            id_cfs=dataPost.get('id_cfs'),
            cant_participan=25,
            cant_grupo=1,
            activo=False,
            entidad_trabajo_id=dataPost.get('entidad_trabajo_id') if dataPost.get('entidad_trabajo_id') else 0,
            fecha_ini=fecha_inicio,
            fecha_fin=fecha_fin,
        )

        auditoria = Auditoria(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='curso_activo',
            accion=1,
            valor_old={},
            valor_new=str(curso_activo.serialize()),
            col_editada='NEW',
        )

        db.session.add(curso_activo)
        db.session.add(auditoria)
        db.session.flush()

        preimpreso_value = (dataPost.get('preimpreso') or '').strip().upper()
        
        preimpreso_existente = PreImpreso.query.filter_by(preimpreso=preimpreso_value).first()
        if preimpreso_existente:
            db.session.rollback()
            return jsonify({'error': 'El preimpreso ya está asociado a otro curso activo'}), 409

        secuencia_preimpreso = preimpreso_value.split('-')[-1]
        
        if not secuencia_preimpreso.isdigit():
            return jsonify({'error': 'El preimpreso no tiene una secuencia numérica válida'}), 400
        secuencia_preimpreso = secuencia_preimpreso.zfill(5)

        ultimo_codigo = PreImpreso.query.filter(PreImpreso.id_curso == curso.id, PreImpreso.codigo.like(f"%{estado_abreviatura.upper()}%")).order_by(PreImpreso.id.desc()).first()

        repeticion = '01'
        if ultimo_codigo:
            partes = str(ultimo_codigo).upper().split('-')
            if len(partes) >= 3:
                match = re.search(r'^A(\d+)$', partes[2])
                if match:
                    repeticion = str(int(match.group(1)) + 1).zfill(2)

        codigo_generado = (
            f"{estado_abreviatura.upper()}-"
            f"{fecha_inicio.strftime('%m/%y')}-"
            f"A{repeticion}-"
            f"{secuencia_preimpreso}"
        )

        preimpreso = PreImpreso(
            id_curso_activo=curso_activo.id,
            preimpreso=preimpreso_value,
            codigo=codigo_generado,
            id_curso=curso.id,
        )

        auditoria_preimpreso = Auditoria(
            usuario_id=request.current_user['id'],
            ip_address=request.remote_addr,
            tabla='preimpreso',
            accion=1,
            valor_old={},
            valor_new=str(preimpreso.serialize()),
            col_editada='NEW',
        )

        db.session.add(preimpreso)
        db.session.add(auditoria_preimpreso)
        db.session.commit()

        return jsonify({'data': curso_activo.serialize(), 'codigo': codigo_generado}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
