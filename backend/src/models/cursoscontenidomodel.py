from app import db
from datetime import datetime


class CursoContenidoModel(db.Model):

    __tablename__ = 'contenido_curso'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    shortname_curso = db.Column(db.String(255), nullable=False)
    contenido = db.Column(db.Text)
    horas = db.Column(db.Integer, nullable=False)
    created_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, shortname_curso, contenido, horas):
        self.shortname_curso = shortname_curso
        self.contenido = contenido
        self.horas = horas
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'shortname_curso': self.shortname_curso,
            'contenido': self.contenido,
            'horas': self.horas,
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

    def delete(self):
        db.session.delete(self)
        db.session.commit()
