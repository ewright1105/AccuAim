from flask import request
from flask_restful import Resource, reqparse
from api.accuaim_db import record_new_shot, update_session_end_time

# This resource handles actions performed on a session that is currently "active".
# It's mapped to /user/<int:UserID>/sessions/<int:SessionID>/active-session in your app.py

class ActiveSession(Resource):

    def post(self, UserID, SessionID):
        """
        Records a new shot for a block within the active session.
        """
        parser = reqparse.RequestParser()
        parser.add_argument('block_id', type=int, required=True, help='Block ID is required to record a shot')
        args = parser.parse_args()

        # Optional: For added security, you could verify here that the
        # block_id belongs to the session_id and user_id.

        result = record_new_shot(args['block_id'])

        if "successfully" in result:
            # Return the latest stats for the session after the shot is recorded.
            return {'message': result}, 201
        else:
            return {'message': result}, 500

    def put(self, UserID, SessionID):
        """
        Ends the active session by setting its end time.
        """
        result = update_session_end_time(SessionID)
        if "correctly" in result:
            return {'message': f'Session {SessionID} finished successfully.'}, 200
        else:
            return {'message': f'Failed to end session: {result}'}, 500