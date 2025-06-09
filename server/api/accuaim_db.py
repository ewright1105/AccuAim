from api.db_utils import *
import re
import bcrypt

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
    Gets all shots for a given session ID by retrieving shots from all blocks in the session.

    Args:
        session_id (int): The session ID to fetch shots for.

    Returns:
        list: A list of dictionaries containing shot details with block information.
    """
    # THE FIX is in the ORDER BY clause below
    sql = """
    SELECT s.ShotID, s.BlockID, s.ShotTime, s.ShotPositionX, s.ShotPositionY, s.Result, 
           b.TargetArea
    FROM shots s
    JOIN blocks b ON s.BlockID = b.BlockID
    WHERE b.SessionID = %s
    ORDER BY b.BlockID, s.ShotTime;
    """
    result = exec_get_all(sql, (session_id,))
    
    # This list comprehension is also corrected to not cause an IndexError
    return [
        {
            'ShotID': shot[0],
            'BlockID': shot[1],
            'ShotTime': shot[2],
            'ShotPositionX': shot[3],
            'ShotPositionY': shot[4],
            'Result': shot[5],
            'TargetArea': shot[6]
        }
        for shot in result
    ]

def get_block_made_shots(block_id):
    """
    Gets all made shots for a given block ID from the database.

    Args:
        block_id (int): The block ID to fetch made shots for.

    Returns:
        list: A list of dictionaries containing made shot details.
    """
    sql = """
    SELECT ShotID, BlockID, ShotTime, ShotPositionX, ShotPositionY, Result
    FROM shots
    WHERE BlockID = %s AND Result = 'Made'
    ORDER BY ShotTime;
    """
    result = exec_get_all(sql, (block_id,))
    return [
        {
            'ShotID': shot[0],
            'BlockID': shot[1],
            'ShotTime': shot[2],
            'ShotPositionX': shot[3],
            'ShotPositionY': shot[4],
            'Result': shot[5]
        }
        for shot in result
    ]

def get_block_missed_shots(block_id):
    """
    Gets all missed shots for a given block ID from the database.

    Args:
        block_id (int): The block ID to fetch missed shots for.

    Returns:
        list: A list of dictionaries containing missed shot details.
    """
    sql = """
    SELECT ShotID, BlockID, ShotTime, ShotPositionX, ShotPositionY, Result
    FROM shots
    WHERE BlockID = %s AND Result = 'Missed'
    ORDER BY ShotTime;
    """
    result = exec_get_all(sql, (block_id,))
    return [
        {
            'ShotID': shot[0],
            'BlockID': shot[1],
            'ShotTime': shot[2],
            'ShotPositionX': shot[3],
            'ShotPositionY': shot[4],
            'Result': shot[5]
        }
        for shot in result
    ]

def record_new_shot(block_id, shot_position_x, shot_position_y, result):
    """
    Records a new shot in the database for a given block.

    Args:
        block_id (int): The block ID to associate the shot with.
        shot_time (str): The timestamp when the shot was taken.
        shot_position_x (float): The X coordinate of the shot.
        shot_position_y (float): The Y coordinate of the shot.
        result (str): The result of the shot, either 'Made' or 'Missed'.
        
    Returns:
        str: Success or error message.
    """
    sql = """
    INSERT INTO shots (BlockID, ShotTime, ShotPositionX, ShotPositionY, Result)
    VALUES (%s, CURRENT_TIMESTAMP, %s, %s, %s);
    """
    try:
        exec_commit(sql, (block_id, shot_position_x, shot_position_y, result))
        return "Shot recorded successfully."
    except Exception as e:
        return f"An error occurred while recording the shot: {e}"
    
def calculate_block_accuracy(block_id):
    """
    Calculates shooting percentage for a specific block.

    Args:
        block_id (int): The block ID to calculate accuracy for.

    Returns:
        str: Formatted string of shooting percentage for the given block.
    """
    made_shots = get_block_made_shots(block_id)
    all_shots = get_block_shots(block_id)
    
    if not all_shots:
        return "0.00%"
    
    shooting_pct = (len(made_shots) / len(all_shots)) * 100
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
        SELECT s.ShotID FROM shots s
        JOIN blocks b ON s.BlockID = b.BlockID
        WHERE b.SessionID = %s
        ORDER BY s.ShotID;
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


def remove_shot(user_id, shot_id):
    """
    Removes the given shot after verifying user ownership.

    Args:
        user_id (int): The user ID requesting the removal.
        shot_id (int): The ID of the shot to be removed.

    Returns:
        str: Success or error message.
    """
    # Verify that the shot belongs to a block in a session owned by the user
    ownership_sql = """
    SELECT s.ShotID
    FROM shots s
    JOIN blocks b ON s.BlockID = b.BlockID
    JOIN practice_sessions ps ON b.SessionID = ps.SessionID
    WHERE s.ShotID = %s AND ps.UserID = %s;
    """
    
    shot_exists = exec_get_one(ownership_sql, (shot_id, user_id))
    
    if not shot_exists:
        return "Error: Shot not found or you don't have permission to remove it."
    
    try:
        remove_sql = "DELETE FROM shots WHERE ShotID = %s"
        exec_commit(remove_sql, (shot_id,))
        return "Shot successfully removed."
    except Exception as e:
        return f"An error occurred while trying to remove the shot: {e}"

def get_all_users():
    """
    retrieves all users from the database
    
    Returns:
        list: a list of tuples containing user details"""
        
    sql = """
    SELECT UserID, Email, FullName, CreatedAt
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
    SELECT UserID, Email, FullName, CreatedAt
    FROM users
    WHERE UserID = %s"""
    
    result = exec_get_one(sql,(UserID,))
    
    if (result):
        return result
    return "User does not exist"
    
def create_user(email, full_name, password):
    """
    Creates a new user in the users table with a hashed password.

    Args:
        email (str): The email of the user
        full_name (str): The full name of the user
        password (str): The user's password (will be hashed)

    Returns:
        str: Success or error message
    """
    if not full_name:
        return "Error: The full name cannot be empty."

    if not is_valid_email(email):
        return "Error: The entered email is not in the correct format."
    
    sql_check = """
    SELECT * FROM users WHERE LOWER(Email) = LOWER(%s)
    """
    
    user_exists = exec_get_one(sql_check, (email,))
    
    if user_exists:
        return "Error: An account with the entered email already exists."
    
    # Hash the password using bcrypt
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    sql = """
    INSERT INTO users (Email, FullName, PasswordHash)
    VALUES (%s, %s, %s);
    """
    try:
        exec_commit(sql, (email, full_name, hashed_password.decode('utf-8')))
        return f"User {full_name} created successfully."
    except Exception as e:
        return f"An error occurred while creating the user: {e}"

    
def remove_user(user_id, password):
    """
    Removes a user from the users table. Associated records are
    deleted automatically by the database via ON DELETE CASCADE.
    """
    # First, check if the user exists and the password is correct
    sql_check = "SELECT UserID, PasswordHash FROM users WHERE UserID = %s"
    user = exec_get_one(sql_check, (user_id,))

    if not user:
        return "Error: User not found."
    
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
        return "Error: Incorrect password."

    # With ON DELETE CASCADE, you only need to delete the user.
    # The database will handle deleting all related sessions, blocks, and shots.
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
    Updates a user's information and optionally their password.

    Args:
        user_id (int): ID of the user to update
        new_name (str): The user's updated name
        new_email (str): The user's updated email
        current_password (str, optional): Current password for verification
        new_password (str, optional): New password to set
        
    Returns:
        str: Success or Error message
    """
    if not is_valid_email(new_email):
        return "Error: Invalid email format."

    # Check if the email is already in use by another user
    existing_user = exec_get_one(
        "SELECT * FROM users WHERE LOWER(email) = LOWER(%s) AND UserID != %s", 
        (new_email, user_id)
    )
    if existing_user:
        return "Error: The new email is already in use by another user."
    
    # Get current user data
    user = exec_get_one(
        "SELECT * FROM users WHERE UserID = %s", 
        (user_id,)
    )
    
    if not user:
        return "Error: User does not exist."

    try:
        # Update without changing password
        sql = """
            UPDATE users 
            SET FullName = %s, email = %s
            WHERE UserID = %s
        """
        exec_commit(sql, (new_name, new_email, user_id))
                
        return f"User successfully updated: Name = {new_name}, Email = {new_email}"
    except Exception as e:
        return f"An error occurred while updating the user: {e}"
    
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
        return {"UserID": user[0], "name": user[1], "email": user[2]}
    
    return None  # Return None if no user is found
def get_session_blocks(session_id):
    """_summary_
    Retrives raw block data for all blocks under given session

    Args:
        session_id (int): session id for session to retreive blocks for
        
    Returns:
        list: a list containing all blocks and their relevant data
    """
    sql = """
    SELECT *
    FROM blocks
    WHERE SessionID = %s"""
    
    session_blocks = exec_get_all(sql, (session_id,))
    
    return session_blocks

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
    
    block_stats = get_session_block_stats(session_id)
    all_shots = []
    total_shots = 0
    made_shots_count = 0
    missed_shots_count = 0
    
    # Get all shots for the session
    for block in block_stats:
       total_shots += block['ShotsPlanned']
       made_shots_count += block['MadeShots']
       missed_shots_count += block ['MissedShots']
       all_shots.append(get_block_shots(block['BlockID']))
       
    
 
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
def login(email, password):
    """
    Verifies a user's credentials.

    Args:
        email (str): The user's email
        password (str): The password to verify

    Returns:
        dict: User information if verified, None if not
    """
    sql = """
    SELECT UserID, Email, FullName, PasswordHash
    FROM users
    WHERE LOWER(Email) = LOWER(%s)
    """
    
    user = exec_get_one(sql, (email,))
    if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
        return {"UserID": user[0], "email": user[1],"name": user[2]}
    return None

def change_password(UserID, current_password, new_password):
    """
    Changes a user's password.

    Args:
        user_id (int): The user's ID
        current_password (str): The current password
        new_password (str): The new password to set

    Returns:
        str: Success or error message
    """
    # Get current user data including password hash
    sql = """
    SELECT PasswordHash
    FROM users
    WHERE UserID = %s
    """
    
    user = exec_get_one(sql, (UserID,))
    
    if not user:
        return "Error: User not found."
        
    # Verify current password
    if not bcrypt.checkpw(current_password.encode('utf-8'), 
                        user[0].encode('utf-8')):
        return "Error: Current password is incorrect."
        
    # Hash and set new password
    salt = bcrypt.gensalt()
    new_hash = bcrypt.hashpw(new_password.encode('utf-8'), salt)
    
    update_sql = """
    UPDATE users
    SET PasswordHash = %s
    WHERE UserID = %s
    """
    
    try:
        exec_commit(update_sql, (new_hash.decode('utf-8'), UserID))
        return "Password successfully updated."
    except Exception as e:
        return f"An error occurred while updating the password: {e}"

def get_all_blocks():
    """
    Retrieves the all blocks from database.

    Returns:
        array: A dictionary containing blocks and relevant details.
    """
    sql = """
    SELECT *
    FROM blocks
    """
    
    result = exec_get_all(sql)
    
    return result

def get_target_area_for_block(block_id):
    """
    Retrieves the target area associated with a specific block.

    Args:
        block_id (int): The ID of the block to retrieve the target area for.

    Returns:
        dict: A dictionary containing block and target area details.
    """
    sql = """
    SELECT b.BlockID, ta.AreaName
    FROM blocks b
    JOIN target_areas ta ON b.TargetAreaID = ta.TargetAreaID
    WHERE b.BlockID = %s;
    """
    
    result = exec_get_one(sql, (block_id,))
    
    if result:
        return {"BlockID": result[0], "TargetArea": result[1]}
    return {"error": "Block not found or has no associated target area."}


def get_block_shots(block_id):
    """
    Gets all shots for a given block ID from the database.

    Args:
        block_id (int): The block ID to fetch shots for.

    Returns:
        list: A list of dictionaries containing shot details.
    """
    sql = """
    SELECT ShotID, BlockID, ShotTime, ShotPositionX, ShotPositionY, Result
    FROM shots
    WHERE BlockID = %s
    ORDER BY ShotTime;
    """
    result = exec_get_all(sql, (block_id,))
    return [
        {
            'ShotID': shot[0],
            'BlockID': shot[1],
            'ShotTime': shot[2],
            'ShotPositionX': shot[3],
            'ShotPositionY': shot[4],
            'Result': shot[5]
        }
        for shot in result
    ]
def get_session_block_stats(session_id):
    """
    Gets shooting statistics for each block in a session, focusing on made, missed, and planned shots.

    Args:
        session_id (int): The session ID to get block stats for.

    Returns:
        list: A list of dictionaries containing block statistics.
    """
    sql = """
    SELECT 
        b.BlockID,
        b.TargetArea,
        b.ShotsPlanned,
        COUNT(CASE WHEN s.Result = 'Made' THEN 1 END) as MadeShots,
        COUNT(CASE WHEN s.Result = 'Missed' THEN 1 END) as MissedShots
    FROM blocks b
    LEFT JOIN shots s ON b.BlockID = s.BlockID
    WHERE b.SessionID = %s
    GROUP BY b.BlockID, b.TargetArea, b.ShotsPlanned
    ORDER BY b.BlockID;
    """
    result = exec_get_all(sql, (session_id,))
    return [
        {
            'BlockID': block[0],
            'TargetArea': block[1],
            'ShotsPlanned': block[2],
            'MadeShots': block[3] or 0,  # Convert None to 0
            'MissedShots': block[4] or 0  # Convert None to 0
        }
        for block in result
    ]

def add_blocks(blocks, session_id):
    """
    Adds given blocks to database 

    Args:
        blocks (dict): contains all blocks fo the givens session id
        session_id (int) : the session to link the blocks to
    
    """
    
    sql = """INSERT INTO blocks (SessionID, TargetArea, ShotsPlanned) VALUES (%s, %s, %s)"""
    for block in blocks:
        exec_commit(sql, (session_id, block["targetArea"], block["shotsPlanned"]))
        
    return (get_session_blocks(session_id))
        
    
def create_session(user_id, blocks):
        """
        Adds session to database correlated with user
        Does not have 

        Args:
            user_id (int): user to link new session to
        
        Returns:
            New Session detais"""
            
        #verify user exists
        if (get_user(user_id) == "User does not exist"):
            return "User does not exist"
        
        sql = """INSERT INTO practice_sessions (UserID) VALUES (%s);"""   
        
        exec_commit(sql, (user_id,)) 

        sessions = get_user_sessions(user_id)
        new_session = sessions[-1]

        add_blocks(blocks, new_session[0])
        
        return(new_session)
    
def update_session_end_time(SessionID):
    """
    Updates the end time for the given session
    
    Args:
        SessionID (int): given session
    
    Return:
        success message"""
        
    sql = "UPDATE practice_sessions SET sessionEnd = CURRENT_TIMESTAMP WHERE SessionID = %s "
    exec_commit(sql, (SessionID,))
    
    return "session updated correctly"

if __name__ == "__main__":
    rebuild_tables()

    

