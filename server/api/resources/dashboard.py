from flask import jsonify
from flask_restful import Resource

from api.accuaim_db import *
from api.db_utils import *

class Dashboard(Resource):
    def get(self, UserID):
        result = get_user_dashboard_stats(UserID)
        return jsonify(result)
        