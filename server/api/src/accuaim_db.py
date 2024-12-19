#file to hold all essential db functions
from src.db_utils import *
def rebuild_tables():
    exec_sql_file('accuaim.sql')

def get_session_shots(session_id):
    """
    Gets all shots for a given session ID from the database.

    Args:
        session_id (int): The session ID to fetch made shots for.

    Returns:
        list: A list of tuples containing made shot details.
    """
    sql = """
    SELECT ShotID, SessionID, ShotTime, ShotPositionX, ShotPositionY, Result
    FROM shots
    WHERE SessionID = %s;
    """
    result = exec_get_all(sql, (session_id,))
    
    return result

def get_session_made_shots(session_id):
    """
    Gets all made shots for a given session ID from the database.

    Args:
        session_id (int): The session ID to fetch made shots for.

    Returns:
        list: A list of tuples containing made shot details.
    """
    sql = """
    SELECT ShotID, SessionID, ShotTime, ShotPositionX, ShotPositionY, Result
    FROM shots
    WHERE SessionID = %s AND Result = 'Made';
    """
    result = exec_get_all(sql, (session_id,))
    
    return result


def get_session_missed_shots(session_id):
    """
    Retrieves all missed shots for a given session ID from the database.

    Args:
        session_id (int): The session ID to fetch missed shots for.

    Returns:
        list: A list of tuples containing missed shot details.
    """
    sql = """
    SELECT ShotID, SessionID, ShotTime, ShotPositionX, ShotPositionY, Result
    FROM shots
    WHERE SessionID = %s AND Result = 'Missed';
    """
    result = exec_get_all(sql, (session_id,))
    
    return result

def record_new_shot(session_id, shot_time, shot_position_x, shot_position_y, result):
    """
    Records a new shot in the database for a given session.

    Args:
        session_id (int): The session ID to associate the shot with.
        shot_time (str): The timestamp when the shot was taken (e.g., '2024-12-01 10:15:00').
        shot_position_x (float): The X coordinate of the shot.
        shot_position_y (float): The Y coordinate of the shot.
        result (str): The result of the shot, either 'Made' or 'Missed'.
        
    Returns:
        str: Success or error message.
    """
    sql = """
    INSERT INTO shots (SessionID, ShotTime, ShotPositionX, ShotPositionY, Result)
    VALUES (%s, %s, %s, %s, %s);
    """
    
    # Execute the insert query with the provided parameters
    try:
        # Call exec_get_all to execute the insert query
        exec_get_all(sql, (session_id, shot_time, shot_position_x, shot_position_y, result))
        return "Shot recorded successfully."
    except Exception as e:
        return f"An error occurred while recording the shot: {e}"
    
def calculate_session_accuracy(session_id):
    """
    Retrieves # of made and total shots of given session from database and calculates shooting percentage

    Args:
        session_id (int): The session ID to fetch missed shots for.

    Returns:
        string: formatted string of shooting percentage for given session
    """
    num_made_shots = len(get_session_made_shots(session_id))
    total_shots = len(get_session_shots(session_id))
    
    shooting_pct = f"{(num_made_shots/total_shots)*100:.2f}"
    
    return shooting_pct+'%'
    



if __name__ == "__main__":
    rebuild_tables()
    print(calculate_session_accuracy(1))
    record_new_shot