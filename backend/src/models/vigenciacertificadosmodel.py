from app import db
from datetime import datetime

class VigenciaCertificadosModel(db.Model):

    __tablename__ = 'vigencia_certificados'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    svg_cara_a = db.Column(db.LargeBinary, nullable=False)
    svg_cara_b = db.Column(db.LargeBinary, nullable=False)
    id_tipo_formacion = db.Column(db.Integer, nullable=False)
    is_vigente = db.Column(db.Boolean, default=True, nullable=False)
    observation = db.Column(db.Text, nullable=True)
    pre_coment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, svg_cara_a, svg_cara_b, id_tipo_formacion, is_vigente, observation, pre_coment):
        self.svg_cara_a = svg_cara_a
        self.svg_cara_b = svg_cara_b
        self.id_tipo_formacion = id_tipo_formacion
        self.is_vigente = is_vigente
        self.observation = observation
        self.pre_coment = pre_coment
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'svg_cara_a': self.svg_cara_a,
            'svg_cara_b': self.svg_cara_b,
            'id_tipo_formacion': self.id_tipo_formacion,
            'is_vigente': self.is_vigente,
            'observation': self.observation,
            'pre_coment': self.pre_coment,
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
