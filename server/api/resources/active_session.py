from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class ActiveSession(Resource):
    def get(self, SessionID):
        return jsonify(get_session_shots(SessionID))
    
    #empty parameter userid from url but not needed for session time
    def put(self,UserID, SessionID):
        result = update_session_end_time(SessionID)     
        return jsonify(result)
         