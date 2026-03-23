from app import db
from datetime import datetime

class TipoFormacionModel(db.Model):
    __tablename__ = 'tipo_formacion'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(75), nullable=False)
    descripcion = db.Column(db.String(255), nullable=True)
    create_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    update_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, nombre, descripcion):
        self.nombre = nombre
        self.descripcion = descripcion

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'create_at': self.create_at,
            'update_at': self.update_at
        }

    def save(self):
        db.session.add(self)
        db.session.commit()
        return self

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        self.update_at = datetime.now()
        db.session.commit()
        return self
