from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class Users(Resource):
    def get(self):
        users = get_all_users()
        return jsonify(users)
    
    def post(self):
        data = request.get_json()
        result = create_user(data["email"], data["name"], data["password"])
        return jsonify(result)