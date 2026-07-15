from app import app, db
from flask import request, jsonify, g
from decorators import token_required
from datetime import datetime

from src.models.empleadormodel import EmpleadorModel as Empleador
from src.models.firmaempleadormodel import FirmaEmpleadorModel as FirmaEmpleador
from src.models.geografiamodel import EstadosModel as Estados
from src.models.tipocontribuyentemodel import TipoContribuyenteModel as TipoContribuyente

from src.services.audit_services import register_audit_action


@app.route('/api/empleadores', methods=['POST'])
@token_required
def create_empleador():
    try:
        dataPost = request.json

        empleador = Empleador(
            rif=dataPost.get('rif'),
            razon_social=dataPost.get('razonSocial'),
            tipo_contribuyente_id=dataPost.get('tipoContribuyenteId'),
            estado_id=dataPost.get('estadoId'),
            domicilio_fiscal=dataPost.get('domicilioFiscal'),
            rif_representante=dataPost.get('rifRepresentante'),
            representante=dataPost.get('representante'),
            telefono_movil=dataPost.get('telefonoMovil'),
            telefono_fijo=dataPost.get('telefonoFijo'),
            correo=dataPost.get('correo')
        )

        empleador.save()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='empleadores',
            accion=1,  # Acción de creación
            valor_old=None,
            valor_new=str(empleador.serialize()),
            col_editada=None
        )

        return jsonify(empleador.serialize()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/empleadores', methods=['GET'])
@token_required
def get_empleadores():
    try:

        # Parámetros de paginación y búsqueda
        page = request.args.get('page', default=1, type=int)
        page_size = request.args.get('page_size', default=50, type=int)
        q = request.args.get('q', default='', type=str).strip()
        state = request.args.get('state', default='', type=str).strip()

        # Validaciones
        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 1
        if page_size > 200:
            page_size = 200

        query = Empleador.query

        if q:
            query = query.filter(Empleador.rif.ilike(f'%{q}%') |
                                 Empleador.razon_social.ilike(f'%{q}%') |
                                 Empleador.rif_representante.ilike(f'%{q}%') |
                                 Empleador.correo.ilike(f'%{q}%'))
        if state:
            estado = Estados.query.filter_by(estado=state).first()
            query = query.filter(Empleador.estado_id == estado.id) if estado else query

        total = query.count()
        total_pages = (total + page_size - 1) // page_size

        empleadores = query.order_by(Empleador.id.desc()).offset(
            (page - 1) * page_size).limit(page_size).all()

        dataEmpleadores = []

        for empleador in empleadores:
            estado_empleador = Estados.query.filter_by(id=empleador.estado_id).first()
            tipo_contribuyente = TipoContribuyente.query.filter_by(
                id=empleador.tipo_contribuyente_id).first()
            firma_empleador = FirmaEmpleador.query.filter_by(empleador_id=empleador.id).first()

            empleador_data = {
                'id': empleador.id,
                'rif': empleador.rif,
                'razonSocial': empleador.razon_social,
                'tipoContribuyenteId': tipo_contribuyente.id if tipo_contribuyente else None,
                'tipoContribuyente': tipo_contribuyente.nombre if tipo_contribuyente else None,
                'estadoId': estado_empleador.id if estado_empleador else None,
                'estado': estado_empleador.estado if estado_empleador else None,
                'domicilioFiscal': empleador.domicilio_fiscal,
                'rifRepresentante': empleador.rif_representante,
                'representante': empleador.representante,
                'telefonoMovil': empleador.telefono_movil,
                'telefonoFijo': empleador.telefono_fijo,
                'correo': empleador.correo,
                'estatus': empleador.estatus,
                'firma': firma_empleador.firma if firma_empleador else None,
                'createdAt': empleador.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updatedAt': empleador.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            dataEmpleadores.append(empleador_data)

        meta = {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
            "state": state,
        }
        return jsonify({'data': dataEmpleadores, 'meta': meta}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/empleadores/<int:empleador_id>', methods=['PUT'])
@token_required
def update_empleador(empleador_id):
    try:
        dataPost = request.json

        empleador = Empleador.query.get(empleador_id)

        if not empleador:
            return jsonify({'error': 'Empleador no encontrado'}), 404

        valor_old = str(empleador.serialize())

        empleador.rif = dataPost.get('rif', empleador.rif)
        empleador.razon_social = dataPost.get(
            'razonSocial', empleador.razon_social)
        empleador.tipo_contribuyente_id = dataPost.get(
            'tipoContribuyenteId', empleador.tipo_contribuyente_id)
        empleador.estado_id = dataPost.get('estadoId', empleador.estado_id)
        empleador.domicilio_fiscal = dataPost.get(
            'domicilioFiscal', empleador.domicilio_fiscal)
        empleador.rif_representante = dataPost.get(
            'rifRepresentante', empleador.rif_representante)
        empleador.representante = dataPost.get(
            'representante', empleador.representante)
        empleador.telefono_movil = dataPost.get(
            'telefonoMovil', empleador.telefono_movil)
        empleador.telefono_fijo = dataPost.get(
            'telefonoFijo', empleador.telefono_fijo)
        empleador.correo = dataPost.get('correo', empleador.correo)

        db.session.commit()

        register_audit_action(
            usuario_id=request.current_user['id'],
            ip_address=g.remote_addr,
            tabla='empleadores',
            accion=2,  # Acción de actualización
            valor_old=valor_old,
            valor_new=str(empleador.serialize()),
            col_editada=None
        )

        return jsonify(empleador.serialize()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
