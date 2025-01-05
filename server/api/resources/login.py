from flask import jsonify
from flask_restful import Resource, request
import bcrypt  # for password hashing and comparison

from api.accuaim_db import *
from api.db_utils import *

class Login(Resource):
    def post(self):
        data = request.get_json()
        
        if not data["email"]:
            return jsonify({"message": "Email is required"})
        if not data["password"]:
            return jsonify({"message": "Password is required"})
        
        user = login(data["email"],data["password"])
        
        return user