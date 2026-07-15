from app import db
from datetime import datetime

class EmpleadorModel(db.Model):

    __tablename__ = 'empleador'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    rif = db.Column(db.String(20), nullable=False)
    razon_social = db.Column(db.Text, nullable=False)
    tipo_contribuyente_id = db.Column(db.Integer, nullable=False)
    estado_id = db.Column(db.Integer, nullable=False)
    domicilio_fiscal = db.Column(db.Text, nullable=False)
    rif_representante = db.Column(db.String(20), nullable=False)
    representante = db.Column(db.String(255), nullable=False)
    telefono_movil = db.Column(db.String(15), nullable=False)
    telefono_fijo = db.Column(db.String(15))
    correo = db.Column(db.String(255), nullable=False)
    estatus = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, rif, razon_social, tipo_contribuyente_id, estado_id, domicilio_fiscal, rif_representante, representante, telefono_movil, telefono_fijo, correo):
        self.rif = rif
        self.razon_social = razon_social
        self.tipo_contribuyente_id = tipo_contribuyente_id
        self.estado_id = estado_id
        self.domicilio_fiscal = domicilio_fiscal
        self.rif_representante = rif_representante
        self.representante = representante
        self.telefono_movil = telefono_movil
        self.telefono_fijo = telefono_fijo
        self.correo = correo
        self.estatus = True
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'rif': self.rif,
            'razon_social': self.razon_social,
            'tipo_contribuyente_id': self.tipo_contribuyente_id,
            'estado_id': self.estado_id,
            'domicilio_fiscal': self.domicilio_fiscal,
            'rif_representante': self.rif_representante,
            'representante': self.representante,
            'telefono_movil': self.telefono_movil,
            'telefono_fijo': self.telefono_fijo,
            'correo': self.correo,
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
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        db.session.commit()
        return self
