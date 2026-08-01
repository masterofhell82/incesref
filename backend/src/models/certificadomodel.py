from app import db
from datetime import datetime, timezone


class CertificadoModel(db.Model):

    __tablename__ = 'certificado'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_persona = db.Column(db.String(20), nullable=False)
    consecutivo = db.Column(db.String(10), nullable=False)
    titulo_asociado = db.Column(db.String(15))
    fecha_emision = db.Column(db.Date, nullable=False)
    preimpreso_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, id_persona, consecutivo, titulo_asociado, fecha_emision, preimpreso_id):
        self.id_persona = id_persona
        self.consecutivo = consecutivo
        self.titulo_asociado = titulo_asociado
        self.fecha_emision = fecha_emision
        self.preimpreso_id = preimpreso_id
        self.created_at = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'id_persona': self.id_persona,
            'preimpreso_id': self.preimpreso_id,
            'consecutivo': self.consecutivo,
            'titulo_asociado': self.titulo_asociado,
            'created_at': self.created_at,
            'fecha_emision': self.fecha_emision
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
