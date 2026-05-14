from app import db
from datetime import date, datetime


class CursoActivoModel(db.Model):

    __tablename__ = 'curso_activo'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_curso = db.Column(db.Integer, nullable=False)
    id_cfs = db.Column(db.Integer, nullable=False)
    cant_participan = db.Column(db.Integer, nullable=False)
    cant_grupo = db.Column(db.Integer, nullable=False, default=1)
    activo = db.Column(db.Boolean, nullable=False, default=True)
    entidad_trabajo_id = db.Column(db.Integer, nullable=False)
    fecha_ini = db.Column(db.Date, nullable=False, default=date.today)
    fecha_fin = db.Column(db.Date, nullable=False, default=date.today)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)
    update_at = db.Column(db.DateTime, nullable=False,
                          default=datetime.now, onupdate=datetime.now)

    def __init__(self, id_curso, id_cfs, cant_participan, cant_grupo=1, activo=True, entidad_trabajo_id=None, fecha_ini=None, fecha_fin=None):
        self.id_curso = id_curso
        self.id_cfs = id_cfs
        self.cant_participan = cant_participan
        self.cant_grupo = cant_grupo
        self.activo = activo
        self.entidad_trabajo_id = entidad_trabajo_id
        self.fecha_ini = fecha_ini if fecha_ini else date.today()
        self.fecha_fin = fecha_fin if fecha_fin else date.today()
        self.created_at = datetime.now()
        self.update_at = datetime.now()

    def serialize(self):
        return {
            'id': self.id,
            'id_curso': self.id_curso,
            'id_cfs': self.id_cfs,
            'cant_participan': self.cant_participan,
            'cant_grupo': self.cant_grupo,
            'activo': self.activo,
            'entidad_trabajo_id': self.entidad_trabajo_id,
            'fecha_ini': self.fecha_ini,
            'fecha_fin': self.fecha_fin,
            'created_at': self.created_at,
            'update_at': self.update_at
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
