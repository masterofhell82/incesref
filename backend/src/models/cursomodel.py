from app import db
from datetime import datetime


class CursoModel(db.Model):

    __tablename__ = 'curso'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text)
    max_participan = db.Column(db.Integer, default=25)
    id_programa = db.Column(db.Integer)
    shortname = db.Column(db.String(255), nullable=False, unique=True)
    tipo_formacion = db.Column(db.Integer, nullable=False)
    create_at = db.Column(
        db.DateTime, default=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    update_at = db.Column(db.DateTime, default=datetime.now().strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, nombre, descripcion, max_participan, id_programa, shortname, tipo_formacion):
        self.id = self.last_curso_id() + 1
        self.nombre = nombre
        self.descripcion = descripcion
        self.max_participan = max_participan
        self.id_programa = id_programa
        self.shortname = shortname
        self.tipo_formacion = tipo_formacion
        self.create_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        self.update_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    @staticmethod
    def last_curso_id():
        last_curso = CursoModel.query.order_by(CursoModel.id.desc()).first()
        return last_curso.id if last_curso else 0

    def serialize(self):
        def to_str(dt):
            if isinstance(dt, str):
                return dt
            if hasattr(dt, 'isoformat'):
                return dt.isoformat(sep=' ', timespec='seconds')
            return str(dt) if dt is not None else None

        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'max_participan': self.max_participan,
            'id_programa': self.id_programa,
            'shortname': self.shortname,
            'tipo_formacion': self.tipo_formacion,
            'create_at': to_str(self.create_at),
            'update_at': to_str(self.update_at)
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
        return self
