from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class SessionDetails(Resource):
    def get(self, UserID, SessionID):
        result = get_session_data(UserID,SessionID)
        return jsonify(result)
        