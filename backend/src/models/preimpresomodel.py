from app import db
from datetime import datetime


class PreImpresoModel(db.Model):
    __tablename__ = 'preimpreso'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_curso_activo = db.Column(db.Integer, nullable=False)
    preimpreso = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(254), nullable=False)
    id_curso = db.Column(db.Integer, nullable=False)
    id_meta = db.Column(db.Integer, nullable=True)
    created_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, id_curso_activo, preimpreso, codigo, id_curso, id_meta=None):
        self.id_curso_activo = id_curso_activo
        self.preimpreso = preimpreso
        self.codigo = codigo
        self.id_curso = id_curso
        self.id_meta = id_meta

    def serialize(self):
        return {
            'id': self.id,
            'id_curso_activo': self.id_curso_activo,
            'preimpreso': self.preimpreso,
            'codigo': self.codigo,
            'id_curso': self.id_curso,
            'id_meta': self.id_meta,
            'created_at': self.created_at
        }

    def save(self):
        db.session.add(self)
        db.session.commit()
        return self

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        db.session.commit()
        return self
