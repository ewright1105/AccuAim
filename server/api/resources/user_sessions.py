from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class UserSessions(Resource):
    def get(self, UserID):
        result = get_user_sessions(UserID)
        return jsonify(result)
        