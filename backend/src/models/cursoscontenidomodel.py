from datetime import datetime, timedelta, timezone
from typing import ClassVar

from app import db

TZ = timezone(timedelta(hours=-4))


class CursoContenidoModel(db.Model):

    __tablename__ = 'contenido_curso'
    __table_args__: ClassVar[dict[str, str]] = {"schema": "master"}

    id = db.Column(db.Integer, primary_key=True)
    shortname_curso = db.Column(db.String(255), nullable=False)
    contenido = db.Column(db.Text)
    horas = db.Column(db.Integer, nullable=False)
    # "enfoque" "master"."enfoque_enum" NOT NULL DEFAULT 'Teorico'::master.enfoque_enum,
    enfoque = db.Column(db.Enum('Teorico', 'Practico', name='enfoque_enum',
                        schema='master'), nullable=False, server_default='Teorico')
    created_at = db.Column(
        db.DateTime, default=datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S'))
    updated_at = db.Column(db.DateTime, default=datetime.now(TZ).strftime(
        '%Y-%m-%d %H:%M:%S'), onupdate=datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S'))

    def __init__(self, shortname_curso, contenido, horas, enfoque):
        self.shortname_curso = shortname_curso
        self.contenido = contenido
        self.horas = horas
        self.enfoque = enfoque
        self.created_at = datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S')
        self.updated_at = datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S')

    def serialize(self):
        def to_str(dt):
            if isinstance(dt, str):
                return dt
            if hasattr(dt, 'isoformat'):
                return dt.isoformat(sep=' ', timespec='seconds')
            return str(dt) if dt is not None else None
        return {
            'id': self.id,
            'shortname_curso': self.shortname_curso,
            'contenido': self.contenido,
            'horas': self.horas,
            'enfoque': self.enfoque,
            'created_at': to_str(self.created_at),
            'updated_at': to_str(self.updated_at)
        }

    def save(self):
        db.session.add(self)
        db.session.commit()
        return self

    def update(self, data):
        for key, value in data.items():
            setattr(self, key, value)
        self.updated_at = datetime.now(TZ).strftime('%Y-%m-%d %H:%M:%S')
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()
