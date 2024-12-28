from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS

from api.db_utils import *
from api.accuaim_db import *
from api.users import *
from api.user import *

app = Flask(__name__)
CORS(app)
api = Api(app)

api.add_resource(Users, '/users')
api.add_resource(User, '/users/<int:UserID>')


if __name__ == "__main__":
    print("Loading db...")
    rebuild_tables()
    print("Starting Flask")
    app.run(debug=True,port=4949)