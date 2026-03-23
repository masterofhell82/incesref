from app import db

class VwCursoPublicado(db.Model):

    __tablename__ = 'vw_curso_publicado'
    __table_args__ = (
        db.PrimaryKeyConstraint('id_cur_activo', 'id_curso', 'id_cfs'),
        {'schema': 'master'}
    )

    id_cur_activo = db.Column(db.Integer, primary_key=True)
    id_curso = db.Column(db.Integer, primary_key=True)
    curso = db.Column(db.String(150))
    id_cfs = db.Column(db.Integer, primary_key=True)
    cfs = db.Column(db.String(150))
    cupos = db.Column(db.Integer)
    participan = db.Column(db.Integer)
    cursando = db.Column(db.Integer)
    estado = db.Column(db.String(50))
    fecha_ini = db.Column(db.Date)
    fecha_fin = db.Column(db.Date)
    fecha_ini_r = db.Column(db.Date)
    fecha_fin_r = db.Column(db.Date)

    def serialize(self):
        return {
            'id_cur_activo': self.id_cur_activo,
            'id_curso': self.id_curso,
            'curso': self.curso,
            'id_cfs': self.id_cfs,
            'cfs': self.cfs,
            'cupos': self.cupos,
            'participan': self.participan,
            'cursando': self.cursando,
            'estado': self.estado,
            'fecha_ini': self.fecha_ini,
            'fecha_fin': self.fecha_fin,
            'fecha_ini_r': self.fecha_ini_r,
            'fecha_fin_r': self.fecha_fin_r,
        }
