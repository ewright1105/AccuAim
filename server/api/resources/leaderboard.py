from flask import jsonify
from flask_restful import Resource

from api.accuaim_db import *
from api.db_utils import *

class Leaderboard(Resource):
    def get(self):
        result = get_leaderboard_stats()
        return jsonify(result)
        