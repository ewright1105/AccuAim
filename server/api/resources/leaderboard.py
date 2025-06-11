from flask_restful import Resource, reqparse
from api.accuaim_db import get_leaderboard_stats

parser = reqparse.RequestParser()

parser.add_argument(
    'sort_by', 
    type=str, 
    default='accuracy', 
    help='Sort leaderboard by a specific metric (accuracy, made, planned)', 
    location='args'  
)

class Leaderboard(Resource):
    def get(self):
        """
        Handles GET requests for the leaderboard and supports sorting.
        """
        args = parser.parse_args()
        
        sort_option = args['sort_by']
        
        stats = get_leaderboard_stats(sort_by=sort_option)
        
        if stats:
            return stats, 200
        else:
            return [], 200