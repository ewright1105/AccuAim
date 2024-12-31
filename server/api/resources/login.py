from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        
        if not email:
            return jsonify({"message": "Email is required"})
        
        # Assuming you have a function `get_user_by_email` that checks if a user exists by email
        
        user = get_user_by_email(email)
        print("User: %s", user)
        if user != None:
            # If user exists, return user info (you can also return user ID here)
            return jsonify({"id": user["id"], "name": user["name"], "email": user["email"]})
        else:
            # If user does not exist, return an error message
            return jsonify({"message": "User not found"})
        