from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from src.accuaim_db import *
from src.db_utils import *

class Users(Resource):
    def get(self):
        users = get_all_users()
        return jsonify(users)
    
    def post(self):
        data = request.get_json()
        result = create_user(data["email"], data["Full Name"])
        return jsonify(result)
    
    def delete(self):
        data = request.get_json()
        result = remove_user(data["UserID"])
        return result
        