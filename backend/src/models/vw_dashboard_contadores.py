from typing import ClassVar

from app import db


class VwDashboardContadores(db.Model):

    __tablename__ = 'vw_dashboard_contadores'
    __table_args__: ClassVar[dict[str, str]] = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    curso_ejecutados = db.Column(db.Integer)
    certificados = db.Column(db.Integer)

    def serialize(self):
        return {
            'id': self.id,
            'curso_ejecutados': self.curso_ejecutados,
            'certificados': self.certificados
        }
