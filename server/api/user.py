from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class User(Resource):
    def get(self,UserID):
        user = get_user(UserID)
        return jsonify(user)
    
    def put(self):
        data = request.get_json()
        result = update_user(data['UserID'], data['name'], data['email'])
        return jsonify(result)
    
    def delete(self):
        data = request.get_json()
        result = remove_user(data["UserID"])
        return jsonify(result)
        