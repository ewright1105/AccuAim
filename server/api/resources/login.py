from flask import jsonify
from flask_restful import Resource, request
import bcrypt  # for password hashing and comparison

from api.accuaim_db import *
from api.db_utils import *

class Login(Resource):
    def post(self):
        # Get the JSON data from the request
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        # Validate input
        if not email:
            return jsonify({"message": "Email is required"})
        if not password:
            return jsonify({"message": "Password is required"})
        
        # Fetch user by email
        user = verify_user(email,password)
        print(user)
        
        if user:
            return user
        else:
            # If password does not match, return error message
            return jsonify({"message": "Invalid credentials"})