from app import db
from datetime import datetime


class CFSModel(db.Model):

    __tablename__ = 'cfs'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_estado = db.Column(db.Integer, nullable=False)
    id_municipios = db.Column(db.Integer, nullable=False)
    id_parroquias = db.Column(db.Integer, nullable=False)
    codigo = db.Column(db.String(15), nullable=False)
    nombre = db.Column(db.String(150), nullable=False)
    direccion = db.Column(db.Text)
    id_ambito = db.Column(db.Integer)
    created_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, id_estado, id_municipios, id_parroquias, codigo, nombre, direccion, id_ambito):
        self.id_estado = id_estado
        self.id_municipios = id_municipios
        self.id_parroquias = id_parroquias
        self.codigo = codigo
        self.nombre = nombre
        self.direccion = direccion
        self.id_ambito = id_ambito
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'id_estado': self.id_estado,
            'id_municipios': self.id_municipios,
            'id_parroquias': self.id_parroquias,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'direccion': self.direccion,
            'id_ambito': self.id_ambito,
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
