from app import db
from datetime import datetime

class AuditoriaModel(db.Model):
    
    __tablename__ = 'auditoria'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.String(36), primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    ip_address = db.Column(db.String(20), nullable=False)
    tabla = db.Column(db.String(30), nullable=False)
    accion = db.Column(db.Integer, nullable=False)
    valor_old = db.Column(db.JSON, nullable=False)
    valor_new = db.Column(db.JSON, nullable=False)
    col_editada = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, usuario_id, ip_address, tabla, accion, valor_old, valor_new, col_editada):
        self.usuario_id = usuario_id
        self.ip_address = ip_address
        self.tabla = tabla
        self.accion = accion
        self.valor_old = valor_old
        self.valor_new = valor_new
        self.col_editada = col_editada
        self.created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'ip_address': self.ip_address,
            'tabla': self.tabla,
            'accion': self.accion,
            'valor_old': self.valor_old,
            'valor_new': self.valor_new,
            'col_editada': self.col_editada,
            'created_at': self.created_at
        }

    def save(self):
        db.session.add(self)
        db.session.commit()
        return self
