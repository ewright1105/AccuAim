from flask import jsonify
from flask_restful import Resource
from flask_restful import request
from ..accuaim_db import change_password

class ChangePassword(Resource):
    def put(self, UserID):
        data = request.get_json()
        
        if "current_password" not in data:
            return jsonify({"message": f"Error: current password is required"})
        if "new_password" not in data:
            return jsonify({"message": f"Error: new password is required"})
        
        result = change_password(UserID, data['current_password'], data['new_password'])
        
        return result
            
        