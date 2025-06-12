from flask import jsonify
from flask_restful import Resource
from flask_restful import request
from ..accuaim_db import change_password

class ChangePassword(Resource):
    def put(self, UserID):
        data = request.get_json()
        
        # --- Validation: Return JSON and a 400 status code for bad requests ---
        if not data or "current_password" not in data or "new_password" not in data:
            # Use a dictionary and a status code. flask_restful handles it correctly.
            return {"message": "Error: Missing required password fields."}, 400
        
        # Call your database function, which returns a plain string
        result_message = change_password(UserID, data['current_password'], data['new_password'])
        
        # --- THE FIX: Check the result and format the response ---
        # Check if the string indicates an error
        if "Error:" in result_message:
            # If there's an error, return a JSON object with the message and a 400 status code
            # This will make `response.ok` FALSE on the frontend.
            return {"message": result_message}, 400
        else:
            # If it's a success, return a JSON object with the message and a 200 status code
            # This will make `response.ok` TRUE on the frontend.
            return {"message": result_message}, 200