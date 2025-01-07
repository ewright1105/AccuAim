from flask import jsonify, request
from flask_restful import Resource
from api.accuaim_db import *
from api.db_utils import *

class UserSessions(Resource):
    def get(self, UserID):
        result = get_user_sessions(UserID)
        return jsonify(result)
    
    def put(self, UserID):
        # Retrieve the data from the request body
        data = request.get_json()  # Get the JSON data from the request body
        blocks = data.get('blocks', [])  # Extract blocks from the JSON data

        # Now, use the blocks and UserID to create a new session
        result = create_session(UserID, blocks)
        
        # Return the result as JSON
        return jsonify(result)
