from app import db
from datetime import datetime


class CertificadoModel(db.Model):

    __tablename__ = 'certificado'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_persona = db.Column(db.String(20), nullable=False)
    hoja = db.Column(db.String(5), nullable=False)
    consecutivo = db.Column(db.String(10), nullable=False)
    titulo_asociado = db.Column(db.String(15))
    id_curso_activo = db.Column(db.Integer, nullable=False)
    libro = db.Column(db.String(3), nullable=False)
    fecha_emision = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, id_persona, hoja, consecutivo, titulo_asociado, id_curso_activo, libro, fecha_emision):
        self.id_persona = id_persona
        self.hoja = hoja
        self.consecutivo = consecutivo
        self.titulo_asociado = titulo_asociado
        self.id_curso_activo = id_curso_activo
        self.libro = libro
        self.fecha_emision = fecha_emision
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'id_persona': self.id_persona,
            'hoja': self.hoja,
            'consecutivo': self.consecutivo,
            'titulo_asociado': self.titulo_asociado,
            'id_curso_activo': self.id_curso_activo,
            'created_at': self.created_at,
            'libro': self.libro,
            'fecha_emision': self.fecha_emision
        }

    def save(self):
        db.session.add(self)
        db.session.commit()
        return self

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        db.session.commit()
        return self
