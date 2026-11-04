from datetime import date

from app import app, db
from decorators import token_required
from flask import jsonify
from sqlalchemy import extract, func
from sqlalchemy.exc import SQLAlchemyError

# Models
from src.models.certificadomodel import CertificadoModel
from src.models.geografiamodel import EstadosModel
from src.models.preimpresomodel import PreImpresoModel
from src.models.vw_dashboard_contadores import VwDashboardContadores

_MONTH_ABBREVIATIONS = (
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
)


@app.route('/api/statistics', methods=['GET'])
@token_required
def get_statistics():
    try:
        statistics = VwDashboardContadores.query.first()
        return jsonify({'data': statistics.serialize()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/statistics/monthly', methods=['GET'])
@token_required
def get_monthly_certificates():
    today = date.today()
    current_month_index = today.year * 12 + today.month - 1
    first_month_index = current_month_index - 11

    start_year, start_month_index = divmod(first_month_index, 12)
    start_date = date(start_year, start_month_index + 1, 1)

    next_month_year, next_month_index = divmod(current_month_index + 1, 12)
    end_date = date(next_month_year, next_month_index + 1, 1)

    year_expression = extract('year', CertificadoModel.fecha_emision)
    month_expression = extract('month', CertificadoModel.fecha_emision)

    try:
        monthly_counts = (
            db.session.query(
                year_expression.label('year'),
                month_expression.label('month'),
                func.count(CertificadoModel.id).label('total'),
            )
            .filter(
                CertificadoModel.fecha_emision >= start_date,
                CertificadoModel.fecha_emision < end_date,
            )
            .group_by(year_expression, month_expression)
            .all()
        )
    except SQLAlchemyError:
        app.logger.exception('Error al consultar certificados por mes')
        return jsonify({'error': 'No se pudieron consultar los certificados'}), 500

    counts_by_month = {
        (int(row.year), int(row.month)): int(row.total)
        for row in monthly_counts
    }

    data = []
    for month_index in range(first_month_index, current_month_index + 1):
        year, zero_based_month = divmod(month_index, 12)
        month = zero_based_month + 1
        data.append({
            'mes': f'{_MONTH_ABBREVIATIONS[month - 1]}-{year % 100:02d}',
            'certificados': counts_by_month.get((year, month), 0),
        })

    return jsonify({'data': data}), 200


@app.route('/api/statistics/last-preimpress', methods=['GET'])
@token_required
def get_last_preimpress_by_state():
    ranked_preimpresos = db.session.query(
        PreImpresoModel.id.label('preimpreso_id'),
        PreImpresoModel.id_meta.label('id_meta'),
        PreImpresoModel.id_curso_activo.label('id_curso_activo'),
        PreImpresoModel.preimpreso.label('preimpreso'),
        PreImpresoModel.codigo.label('codigo'),
        PreImpresoModel.created_at.label('created_at'),
        func.row_number().over(
            partition_by=PreImpresoModel.id_meta,
            order_by=(
                PreImpresoModel.created_at.desc(),
                PreImpresoModel.id.desc(),
            ),
        ).label('row_number'),
    ).subquery()

    latest_consecutivo = (
        db.session.query(CertificadoModel.consecutivo)
        .filter(
            CertificadoModel.preimpreso_id
            == ranked_preimpresos.c.preimpreso_id
        )
        .order_by(
            CertificadoModel.created_at.desc(),
            CertificadoModel.id.desc(),
        )
        .limit(1)
        .scalar_subquery()
    )

    try:
        rows = (
            db.session.query(
                EstadosModel.estado.label('estado'),
                ranked_preimpresos.c.id_curso_activo,
                latest_consecutivo.label('consecutivo'),
                ranked_preimpresos.c.preimpreso,
                ranked_preimpresos.c.codigo,
                ranked_preimpresos.c.created_at,
            )
            .join(
                ranked_preimpresos,
                EstadosModel.id == ranked_preimpresos.c.id_meta,
            )
            .filter(ranked_preimpresos.c.row_number == 1)
            .order_by(ranked_preimpresos.c.created_at.desc())
            .all()
        )
    except SQLAlchemyError:
        app.logger.exception('Error al consultar el último preimpreso por estado')
        return jsonify({'error': 'No se pudieron consultar los preimpresos'}), 500

    data = [
        {
            'estado': row.estado,
            'id_curso_activo': row.id_curso_activo,
            'consecutivo': row.consecutivo,
            'preimpreso': row.preimpreso,
            'codigo': row.codigo,
            'created_at': row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]

    return jsonify({'data': data}), 200

