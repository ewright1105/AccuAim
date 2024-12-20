from src.db_utils import *

def rebuild_tables():
    exec_sql_file('accuaim.sql')

def get_user_sessions(user_id):
    """
    Gets all sessions under given user

    Args:
        user_id (int): The user id to fetch sessions for
        
    Returns:
        list: a list of tuples containing session details
    """
    
    sql = """
    SELECT * 
    FROM practice_sessions 
    WHERE practice_sessions.UserID = %s;
    """
    
    result = exec_get_all(sql, (user_id,))
    
    return result
    
    
    
def get_session_shots(session_id):
    """
    Gets all shots for a given session ID from the database.

    Args:
        session_id (int): The session ID to fetch made shots for.

    Returns:
        list: A list of tuples containing shot details.
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
    Retrieves the number of made and total shots of the given session from the database 
    and calculates shooting percentage.

    Args:
        session_id (int): The session ID to fetch missed shots for.

    Returns:
        string: formatted string of shooting percentage for the given session.
    """
    num_made_shots = len(get_session_made_shots(session_id))
    total_shots = len(get_session_shots(session_id))
    
    if total_shots == 0:
        return "0.00%"  # Avoid division by zero if no shots are recorded
    
    shooting_pct = (num_made_shots / total_shots) * 100
    return f"{shooting_pct:.2f}%"

def reorder_shots(session_id):
    """
    Reorders the ShotIDs for a given session to maintain a continuous sequence.
    
    Args:
        session_id (int): The session ID to reorder shots for.
    
    Returns:
        str: Success or error message.
    """
    # Fetch all shots for the session, ordered by ShotID
    sql = """
    SELECT ShotID FROM shots WHERE SessionID = %s ORDER BY ShotID;
    """
    shots = exec_get_all(sql, (session_id,))
    
    # If there are shots to reorder
    if not shots:
        return "No shots found in this session."

    # Reorder ShotIDs starting from 1, sequentially
    try:
        for index, shot in enumerate(shots, start=1):
            shot_id = shot[0]
            update_sql = "UPDATE shots SET ShotID = %s WHERE ShotID = %s"
            exec_commit(update_sql, (index, shot_id))
        
        return "Shots reordered successfully."
    except Exception as e:
        return f"An error occurred while reordering shots: {e}"


def remove_shot(user_id, session_id, shot_id):
    """
    Removes the given shot from the specified session.

    Args:
        user_id (int): The user ID requesting the removal.
        session_id (int): The session ID to which the shot belongs.
        shot_id (int): The ID of the shot to be removed.

    Returns:
        str: Success or error message.
    """
    # Check if the session belongs to the user
    user_sessions = get_user_sessions(user_id)
    
    # Check if the session_id exists for this user
    for session in user_sessions:
        if session[0] == session_id:  # assuming session[0] is session_id
            # Session found, proceed to remove the shot
            remove_sql = "DELETE FROM shots WHERE shots.ShotID = %s"
            try:
                exec_commit(remove_sql, (shot_id,))
                reorder_shots(session_id)
                return "Shot successfully removed."
            except Exception as e:
                return f"An error occurred while trying to remove the shot: {e}"
    
    # If session_id was not found for the user
    return "Error: The specified session does not belong to the user."

            
   

if __name__ == "__main__":
    rebuild_tables()
    print(get_session_shots(1))
    
    print(remove_shot(1, 1, 3))  # Remove shot with ID 3 from session 1 for user 1
    
    print(get_session_shots(1))

