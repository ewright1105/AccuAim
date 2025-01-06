from flask import jsonify
from flask_restful import Resource, request

from api.accuaim_db import *
from api.db_utils import *

class Blocks(Resource):
    def get(self):
        return jsonify(get_all_blocks())