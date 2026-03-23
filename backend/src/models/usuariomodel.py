from app import db
from datetime import datetime


class UsuarioModel(db.Model):
    __tablename__ = 'usuario'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_persona = db.Column(db.String(20), nullable=False)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(150), nullable=False)
    activado = db.Column(db.Boolean, default=False)
    id_rol = db.Column(db.Integer)
    temp_pass = db.Column(db.String(150), nullable=False, default='')
    created_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))


    def __init__(self, id_persona, username, password, activado=False, id_rol=None, temp_pass=''):
        self.id_persona = id_persona
        self.username = username
        self.password = password
        self.activado = activado
        self.id_rol = id_rol
        self.temp_pass = temp_pass
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'id_persona': self.id_persona,
            'username': self.username,
            'password': self.password,
            'activado': self.activado,
            'id_rol': self.id_rol,
            'temp_pass': self.temp_pass,
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
