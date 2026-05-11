from app import db
from datetime import datetime


class PersonasModel(db.Model):
    __tablename__ = 'persona'
    __table_args__ = {'schema': 'master'}

    cedula = db.Column(db.String(20), primary_key=True)
    nac = db.Column(db.String(1), nullable=False)
    nombres = db.Column(db.String(150), nullable=False)
    apellidos = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(20))
    correo = db.Column(db.String(150), nullable=False)
    sexo = db.Column(db.String(1))
    fecha_nace = db.Column(db.Date)
    created_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, cedula, nac, nombres, apellidos, telefono=None, correo=None, sexo=None, fecha_nace=None):
        self.cedula = cedula
        self.nac = nac
        self.nombres = nombres
        self.apellidos = apellidos
        self.telefono = telefono
        self.correo = correo
        self.sexo = sexo
        self.fecha_nace = fecha_nace
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'cedula': self.cedula,
            'nac': self.nac,
            'nombres': self.nombres,
            'apellidos': self.apellidos,
            'telefono': self.telefono,
            'correo': self.correo,
            'sexo': self.sexo,
            'fecha_nace': self.fecha_nace,
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
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        db.session.commit()
