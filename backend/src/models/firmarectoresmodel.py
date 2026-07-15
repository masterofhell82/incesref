from app import db
from datetime import datetime


class FirmaRectoresModel(db.Model):

    __tablename__ = 'firma_rectores'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    rectores_id = db.Column(db.Integer, nullable=False)
    firma = db.Column(db.LargeBinary)
    created_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, rectores_id, firma):
        self.rectores_id = rectores_id
        self.firma = firma
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'rectores_id': self.rectores_id,
            'firma': self.firma,
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
