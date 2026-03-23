from app import db

class EstadosModel(db.Model):

    __tablename__ = 'estados'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    estado = db.Column(db.String(250), nullable=False)
    iso_3166_2 = db.Column(db.String(4), nullable=False)
    abreviatura = db.Column(db.String(2))

    def __init__(self, estado, iso_3166_2, abreviatura):
        self.estado = estado
        self.iso_3166_2 = iso_3166_2
        self.abreviatura = abreviatura

    def serialize(self):
        return {
            'id': self.id,
            'estado': self.estado,
            'iso_3166_2': self.iso_3166_2,
            'abreviatura': self.abreviatura
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


class MunicipiosModel(db.Model):

    __tablename__ = 'municipios'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_estado = db.Column(db.Integer, nullable=False)
    municipio = db.Column(db.String(100), nullable=False)

    def __init__(self, id_estado, municipio):
        self.id_estado = id_estado
        self.municipio = municipio

    def serialize(self):
        return {
            'id': self.id,
            'id_estado': self.id_estado,
            'municipio': self.municipio
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


class CiudadesModel(db.Model):

    __tablename__ = 'ciudades'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_estado = db.Column(db.Integer, nullable=False)
    ciudad = db.Column(db.String(200), nullable=False)
    capital = db.Column(db.Boolean, nullable=False)

    def __init__(self, id_estado, ciudad, capital):
        self.id_estado = id_estado
        self.ciudad = ciudad
        self.capital = capital

    def serialize(self):
        return {
            'id': self.id,
            'id_estado': self.id_estado,
            'ciudad': self.ciudad,
            'capital': self.capital
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


class ParroquiasModel(db.Model):

    __tablename__ = 'parroquias'
    __table_args__ = {'schema': 'master'}

    id = db.Column(db.Integer, primary_key=True)
    id_municipio = db.Column(db.Integer, nullable=False)
    parroquia = db.Column(db.String(250), nullable=False)

    def __init__(self, id_municipio, parroquia):
        self.id_municipio = id_municipio
        self.parroquia = parroquia

    def serialize(self):
        return {
            'id': self.id,
            'id_municipio': self.id_municipio,
            'parroquia': self.parroquia
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
