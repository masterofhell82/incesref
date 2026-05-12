from app import db
from datetime import datetime


class EntidadTrabajo(db.Model):

    __tablename__ = 'entidad_trabajo'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    rif = db.Column(db.String(150), nullable=False)
    nombre = db.Column(db.String(255), nullable=False)
    direccion = db.Column(db.Text, nullable=False)
    estado_id = db.Column(db.Integer, nullable=False)
    estatus = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, rif, nombre, direccion, estado_id, estatus=True):
        self.rif = rif
        self.nombre = nombre
        self.direccion = direccion
        self.estado_id = estado_id
        self.estatus = estatus
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'rif': self.rif,
            'nombre': self.nombre,
            'direccion': self.direccion,
            'estado_id': self.estado_id,
            'estatus': self.estatus,
            'created_at': self.created_at,
            'updated_at': self.updated_at
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
