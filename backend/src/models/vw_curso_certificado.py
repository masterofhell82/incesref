from app import db


class VwCursoCertificado(db.Model):

    __tablename__ = 'vw_cursos_certificados'
    __table_args__ = {'schema': 'master'}

    preimpreso_id = db.Column(db.Integer, primary_key=True)
    preimpreso = db.Column(db.String(100))
    curso_activo_id = db.Column(db.Integer, primary_key=True)
    id_cfs = db.Column(db.Integer)
    estado_id = db.Column(db.Integer)
    curso_id = db.Column(db.Integer, primary_key=True)
    shortname = db.Column(db.String(150))
    nombre = db.Column(db.String(150))
    certificados = db.Column(db.BigInteger)
    fecha_emision = db.Column(db.Date)
    fecha_ini = db.Column(db.Date)
    fecha_fin = db.Column(db.Date)

    def serialize(self):
        return {
            'preimpreso_id': self.preimpreso_id,
            'preimpreso': self.preimpreso,
            'curso_activo_id': self.curso_activo_id,
            'id_cfs': self.id_cfs,
            'estado_id': self.estado_id,
            'curso_id': self.curso_id,
            'shortname': self.shortname,
            'nombre': self.nombre,
            'certificados': self.certificados,
            'fecha_emision': self.fecha_emision,
            'fecha_ini': self.fecha_ini,
            'fecha_fin': self.fecha_fin
        }
