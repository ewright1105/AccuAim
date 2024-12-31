from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS

from api.db_utils import *
from api.accuaim_db import *
from api.resources.users import *
from api.resources.user import *
from api.resources.login import *
from api.resources.user_sessions import *
from api.resources.session_details import *

app = Flask(__name__)
CORS(app)
api = Api(app)

api.add_resource(Users, '/')
api.add_resource(User, '/user/<int:UserID>')
api.add_resource(Login, '/user/login')
api.add_resource(UserSessions, '/user/<int:UserID>/sessions')
api.add_resource(SessionDetails, '/user/<int:UserID>/sessions/<int:SessionID>')


if __name__ == "__main__":
    print("Loading db...")
    rebuild_tables()
    print("Starting Flask")
    app.run(debug=True,port=4949)