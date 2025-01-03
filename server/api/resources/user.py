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
        
        # If password is being updated, change the password
        if 'current_password' in data and 'new_password' in data:
            result = change_password(data['UserID'], data['current_password'], data['new_password'])
            return jsonify({"message": result})
        
        # Otherwise, update user details without password change
        result = update_user(data['UserID'], data['name'], data['email'])
        return jsonify({"message": result})
    
    def delete(self):
        data = request.get_json()
        result = remove_user(data["UserID"],data["password"])
        return jsonify(result)
        