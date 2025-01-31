from flask import jsonify
from flask_restful import Resource
from flask_restful import request

from api.accuaim_db import *
from api.db_utils import *

class RecordShot(Resource):
    def post(self, blockId, shotPositionx, shotPositiony, result):
        result = record_new_shot(blockId,shotPositionx,shotPositiony,result)
        return jsonify(result)