from app import db
from datetime import datetime
import uuid

class UsuarioRolModel(db.Model):
    __tablename__ = 'usuario_rol'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('master.usuario.id'), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('master.rol.id'), nullable=False)
    estado_id = db.Column(db.Integer, db.ForeignKey('master.estados.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def __init__(self, user_id, rol_id, estado_id):
        self.user_id = user_id
        self.rol_id = rol_id
        self.estado_id = estado_id
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'rol_id': self.rol_id,
            'estado_id': self.estado_id,
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
