from app import db
from datetime import datetime


class ProgramaModel(db.Model):

    __tablename__ = 'programa'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text)
    is_activo = db.Column(db.Boolean, default=True)
    create_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    update_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, nombre, descripcion, is_activo):
        self.nombre = nombre
        self.descripcion = descripcion
        self.is_activo = is_activo
        self.create_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.update_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'is_activo': self.is_activo,
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
        self.update_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        db.session.commit()
