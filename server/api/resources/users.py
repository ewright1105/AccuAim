from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class Users(Resource):
    def get(self):
        users = get_all_users()
        return jsonify(users)
    
    def put(self):
        data = request.get_json()
        if 'current_password' in data and 'new_password' in data:
            # Ensure current password and new password are provided for update
            result = change_password(data['UserID'], data['current_password'], data['new_password'])
            return jsonify({"message": result})
        
        # Otherwise, update user details without password change
        result = update_user(data['UserID'], data['name'], data['email'])
        return jsonify({"message": result})
    
    def post(self):
        data = request.get_json()
        result = create_user(data["email"], data["name"], data["password"])
        return jsonify(result)
    
    def delete(self):
        data = request.get_json()
        result = remove_user(data["UserID"], data["password"])
        return jsonify(result)
        