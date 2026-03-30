from flask import Flask
from flask_qrcode import QRcode
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__, template_folder=os.path.abspath('src/views'))
app.config.from_object('config.Config')
db = SQLAlchemy(app)

CORS(app)
resouces = {r"/api/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]}
}
app.config['CORS_RESOURCES'] = resouces
app.config['CORS_HEADERS'] = 'Content-Type'
app.config["JSON_SORT_KEYS"] = False

QRcode(app)

if __name__ == '__main__':
    from src.helpers.filters import *
    from src.controllers.authcontroller import *
    from src.controllers.ambitocontroller import *
    from src.controllers.certificadocontroller import *
    from src.controllers.cfscontroller import *
    from src.controllers.geografiacontroller import *
    from src.controllers.userscontroller import *
    from src.controllers.personcontroller import *
    app.run(host='0.0.0.0', port=3010, debug=app.config['DEBUG'])
