from decouple import config as Config


class Config:
    SQLALCHEMY_DATABASE_URI = Config("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = Config("SECRET_KEY")
    PRIVATE_TOKEN = Config("PRIVATE_TOKEN")
    DEBUG = Config("DEBUG", default=False, cast=bool)
    BASE_URL = Config("BASE_URL")
