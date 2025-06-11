from flask_restful import Resource, reqparse
from api.accuaim_db import get_leaderboard_stats

# Create the request parser
parser = reqparse.RequestParser()

# Add the 'sort_by' argument and EXPLICITLY tell it to look in the URL's query string ('args')
parser.add_argument(
    'sort_by', 
    type=str, 
    default='accuracy', 
    help='Sort leaderboard by a specific metric (accuracy, made, planned)', 
    location='args'  # <-- THIS IS THE FIX
)

class Leaderboard(Resource):
    def get(self):
        """
        Handles GET requests for the leaderboard and supports sorting.
        """
        # This will now correctly parse from the URL without checking Content-Type
        args = parser.parse_args()
        
        sort_option = args['sort_by']
        
        stats = get_leaderboard_stats(sort_by=sort_option)
        
        if stats:
            return stats, 200
        else:
            return [], 200