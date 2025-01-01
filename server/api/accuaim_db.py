from api.db_utils import *
import re

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
    all_shots = [
        {
            'ShotID': shot[0],
            'SessionID': shot[1],
            'ShotTime': shot[2],  # Make sure this is in the correct format, e.g., ISO string
            'ShotPositionX': shot[3],
            'ShotPositionY': shot[4],
            'Result': shot[5]
        }
        for shot in result
    ]
    return all_shots

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
        str: formatted string of shooting percentage for the given session.
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

def get_all_users():
    """
    retrieves all users from the database
    
    Returns:
        list: a list of tuples containing user details"""
        
    sql = """
    SELECT *
    FROM users
    ORDER BY UserID"""
    
    results = exec_get_all(sql)
    
    return results

def get_user(UserID):
    """
    Retrieves a users information using given UserID

    Args:
        user_id (int): UserID to fetch informaiton for
        
    Returns:
        tuple: tuple containing all information connected to given UserID, if it exists
    """
    sql = """
    SELECT *
    FROM users
    WHERE UserID = %s"""
    
    result = exec_get_one(sql,(UserID,))
    
    if (result):
        return result
    return "User does not exist"
    
def create_user(email, full_name):
    """
    Creates a new user in the users table.

    Args:
        email (str): The email of the user.
        full_name (str): The full name of the user.

    Returns:
        str: Success or error message.
    """
    # Validate the email format
    if not is_valid_email(email):
        return f"Error: The entered email is not in the correct format."
    
    # Check if a user with the given email already exists
    sql_check = """
    SELECT * FROM users WHERE LOWER(Email) = LOWER(%s)
    """
    
    user_exists = exec_get_one(sql_check, (email,))
    
    if user_exists:
        return f"Error: An account with the entered email already exists."
    
    # If the email format is valid and it doesn't already exist, insert the new user
    sql = """
    INSERT INTO users (Email, FullName)
    VALUES (%s, %s);
    """
    try:
        # Execute the SQL to insert the user
        exec_commit(sql, (email, full_name))
        return f"User {full_name} created successfully."
    except Exception as e:
        return f"An error occurred while creating the user: {e}"

    
def remove_user(user_id):
    """
    Removes a user from the users table based on their UserID.

    Args:
        user_id (int): The ID of the user to remove.

    Returns:
        str: Success or error message.
    """
     # First, check if the user exists
    sql_check = "SELECT * FROM users WHERE UserID = %s"
    user_exists = exec_get_one(sql_check, (user_id,))

    if not user_exists:
        return "Error: User not found."

    # Delete associated shots
    sql_delete_shots = "DELETE FROM shots WHERE SessionID IN (SELECT SessionID FROM practice_sessions WHERE UserID = %s)"
    exec_commit(sql_delete_shots, (user_id,))

    # Delete associated practice sessions
    sql_delete_sessions = "DELETE FROM practice_sessions WHERE UserID = %s"
    exec_commit(sql_delete_sessions, (user_id,))

    # Delete user
    sql_delete_user = "DELETE FROM users WHERE UserID = %s"
    try:
        exec_commit(sql_delete_user, (user_id,))
        return f"User with ID {user_id} and all associated records removed successfully."
    except Exception as e:
        return f"An error occurred while removing the user: {e}"
    
def get_user_id(user_email):
    """ 
    Retrieves the corresponding UserID for the user email provided

    Args:
        user_email (str): user email to fetch ID for
        
    Returns:
        int: UserID for given email, or -1 if user DNE
    """
    sql = """
    SELECT * 
    FROM users
    WHERE Email = %s"""
    user = exec_get_one(sql, (user_email,))
    if user:
        return user[0]
    return -1


def is_valid_email(email):
    """
    Validates the email format using a regular expression.
    
    Args:
        email (str): The email to validate.
        
    Returns:
        bool: True if valid, False otherwise.
    """
    # Improved regex pattern for validating email format
    email_regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    
    # Use re.fullmatch to ensure the entire string matches the pattern
    if re.fullmatch(email_regex, email):
        return True
    else:
        return False


def update_user(user_id, new_name, new_email):
    """
    Updates both a user's name and email with new values.

    Args:
        user_id (int): ID of the user to update.
        new_name (str): The user's updated name.
        new_email (str): The user's updated email.
        
    Returns:
        str: Success or Error message.
    """
    
    # Validate email format
    if not is_valid_email(new_email):
        return "Error: Invalid email format."

    # Check if the email is already in use by another user
    existing_user = exec_get_one("SELECT * FROM users WHERE LOWER(email) = LOWER(%s) AND UserID != %s", (new_email, user_id))
    if existing_user:
        return "Error: The new email is already in use by another user."
    
    # Check if user exists
    user = exec_get_one("SELECT * FROM users WHERE UserID = %s", (user_id,))
    
    if user:
        try:
            # Execute the SQL to update both name and email
            sql = """
                UPDATE users 
                SET FullName = %s, email = %s 
                WHERE UserID = %s
            """
            exec_commit(sql, (new_name, new_email, user_id))
            return f"User successfully updated: Name = {new_name}, Email = {new_email}."
        except Exception as e:
            return f"An error occurred while updating the user: {e}"
    else:
        return "Error: User does not exist."
    
def get_user_by_email(email):
    """
    Retrieves a user's information by their email.

    Args:
        email (str): The email to fetch user information for.

    Returns:
        dict: A dictionary containing user information if the user exists, otherwise None.
    """
    # Query to fetch the user by email
    sql = """
    SELECT UserID, FullName, Email
    FROM users
    WHERE LOWER(Email) = LOWER(%s);
    """
    
    user = exec_get_one(sql, (email,))
    
    if user:
        # Return a dictionary with the user's details
        return {"id": user[0], "name": user[1], "email": user[2]}
    
    return None  # Return None if no user is found

def get_session_data(user_id, session_id):
    """
    Retrieves important session data: made shots, missed shots, shooting percentage, and total shots taken.
    Ensures that the session belongs to the given user.

    Args:
        user_id (int): The user ID to check ownership.
        session_id (int): The session ID to fetch data for.
    
    Returns:
        dict: A dictionary containing session data (made shots, missed shots, etc.) if valid, 
              otherwise a message indicating no access or invalid session.
    """
    # Check if the session belongs to the user
    sql = """
    SELECT * FROM practice_sessions 
    WHERE SessionID = %s AND UserID = %s;
    """
    session_exists = exec_get_one(sql, (session_id, user_id))
    
    if not session_exists:
        # If session doesn't belong to the user, return an error message
        return {"error": "This session does not belong to the user or does not exist."}
    
    # Get all shots for the session
    all_shots = get_session_shots(session_id)
    made_shots = get_session_made_shots(session_id)
    missed_shots = get_session_missed_shots(session_id)
    
    total_shots = len(all_shots)
    made_shots_count = len(made_shots)
    missed_shots_count = len(missed_shots)
    
    # Calculate shooting percentage (handle division by zero)
    if total_shots == 0:
        shooting_percentage = 0.0
    else:
        shooting_percentage = (made_shots_count / total_shots) * 100
    
    # Prepare the response as a dictionary, ordering the keys as per your requirement
    session_data = {
        'user_id': user_id,
        'session_id': session_id,
        'made_shots': made_shots_count,
        'missed_shots': missed_shots_count,
        'total_shots': total_shots,
        'shooting_percentage': f"{shooting_percentage:.2f}%",
        'shots': all_shots
    }
    
    return session_data


    
    
    
if __name__ == "__main__":
    rebuild_tables()
    print(create_user("test@example.com", "John Doe"))
    print(create_user("invalid-email", "John Doe"))
    print(create_user("test@example.com", "Jane Doe"))


