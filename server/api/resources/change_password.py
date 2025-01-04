from flask import jsonify
from flask_restful import Resource
from flask_restful import request
from ..accuaim_db import change_password

class ChangePassword(Resource):
    def put(self, UserID):  # Add UserID parameter to match URL route
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['current_password', 'new_password']
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Error: {field} is required"})
        
        try:
            result = change_password(
                UserID,  # Use URL parameter
                data['current_password'],
                data['new_password']
            )
            
            # If change_password returns a string containing "Error", it's an error message
            if isinstance(result, str) and "Error" in result:
                return jsonify({"message": result})
            
            return jsonify({"message": "Password updated successfully"})
            
        except Exception as e:
            return jsonify({"message": f"Error: {str(e)}"})