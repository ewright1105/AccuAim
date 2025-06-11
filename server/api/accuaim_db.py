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

def record_new_shot(block_id):
    """
    Records a new MADE shot in the database for a given block.
    The existence of a row in the 'shots' table signifies a made shot.
    """
    sql = "INSERT INTO shots (BlockID) VALUES (%s);"
    try:
        exec_commit(sql, (block_id,))
        return "Made shot recorded successfully."
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

# In accuaim_db.py

def get_session_data(user_id, session_id):
    """
    Retrieves important session data. Now includes block_stats for the new UI.
    """
    # ... (ownership check remains the same)
    sql_check = "SELECT * FROM practice_sessions WHERE SessionID = %s AND UserID = %s;"
    session_exists = exec_get_one(sql_check, (session_id, user_id))
    
    if not session_exists:
        return {"error": "This session does not belong to the user or does not exist."}
    
    # This is the function that correctly calculates all block stats
    block_stats = get_session_block_stats(session_id)
    
    # Initialize counters
    made_shots_count = 0
    total_planned_shots = 0
    
    # Calculate totals from the block_stats
    for block in block_stats:
       total_planned_shots += block['ShotsPlanned']
       made_shots_count += block['MadeShots']
    
    # Calculate derived stats
    missed_shots_count = total_planned_shots - made_shots_count
    shooting_percentage = (made_shots_count / total_planned_shots * 100) if total_planned_shots > 0 else 0.0
    
    # Build the final response dictionary
    session_data = {
        'session_id': session_id,
        'made_shots': made_shots_count,
        'missed_shots': missed_shots_count,
        'total_shots': total_planned_shots, # Renamed for clarity
        'shooting_percentage': f"{shooting_percentage:.1f}%",
        'block_stats': block_stats  # <-- ADD THIS KEY. This is the crucial fix.
        # 'shots' array is no longer needed for this screen, so it's removed.
    }
    
    return session_data
    
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

def get_block_shots(block_id):
    """
    Gets all made shots for a given block ID from the database.
    """
    sql = """
    SELECT ShotID, BlockID, ShotTime
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
        }
        for shot in result
    ]
def get_session_block_stats(session_id):
    """
    Gets shooting statistics for each block in a session.
    Missed shots are now calculated (ShotsPlanned - MadeShots).
    """
    sql = """
    SELECT 
        b.BlockID,
        b.TargetArea,
        b.ShotsPlanned,
        COUNT(s.ShotID) as MadeShots
    FROM blocks b
    LEFT JOIN shots s ON b.BlockID = s.BlockID
    WHERE b.SessionID = %s
    GROUP BY b.BlockID, b.TargetArea, b.ShotsPlanned
    ORDER BY b.BlockID;
    """
    result = exec_get_all(sql, (session_id,))
    
    # Calculate missed shots in Python
    return [
        {
            'BlockID': block[0],
            'TargetArea': str(block[1]), # Cast ENUM to string
            'ShotsPlanned': block[2],
            'MadeShots': block[3] or 0,
            'MissedShots': block[2] - (block[3] or 0) # The new calculation
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
    Adds session to database correlated with user.
    The session start time is automatically set to the current time.

    Args:
        user_id (int): The user to link the new session to.
        blocks (list): A list of block dictionaries to add to the session.
    
    Returns:
        tuple: The new session's details, or an error string.
    """
    if get_user(user_id) == "User does not exist":
        return "User does not exist"
    
    sql = """INSERT INTO practice_sessions (UserID, SessionStart) VALUES (%s, CURRENT_TIMESTAMP);"""   
    
    exec_commit(sql, (user_id,)) 

    sessions = get_user_sessions(user_id)
    new_session = sessions[-1]

    add_blocks(blocks, new_session[0])
    
    return new_session

    
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

def get_leaderboard_stats(sort_by='accuracy'):
    """
    Retrieves the leaderboard statistics for all users, sorted by a given parameter.
    This version wraps the main query in a CTE to allow sorting by aliased columns.
    """
    if sort_by not in ['accuracy', 'made', 'planned']:
        sort_by = 'accuracy'
        
    sql = """
    WITH UserPlanned AS (
        SELECT ps.UserID, SUM(b.ShotsPlanned) AS TotalPlanned
        FROM practice_sessions ps
        JOIN blocks b ON ps.SessionID = b.SessionID
        GROUP BY ps.UserID
    ),
    UserMade AS (
        SELECT ps.UserID, COUNT(s.ShotID) AS TotalMade
        FROM practice_sessions ps
        JOIN blocks b ON ps.SessionID = b.SessionID
        JOIN shots s ON b.BlockID = s.BlockID
        GROUP BY ps.UserID
    ),
    -- THIS IS THE NEW CTE WRAPPER
    LeaderboardData AS (
        SELECT
            u.UserID,
            u.FullName,
            COALESCE(um.TotalMade, 0) AS TotalMade,
            COALESCE(up.TotalPlanned, 0) AS TotalPlanned,
            ROUND(
                COALESCE(um.TotalMade, 0) * 100.0 / NULLIF(COALESCE(up.TotalPlanned, 0), 0), 2
            ) AS AccuracyPercent
        FROM users u
        LEFT JOIN UserPlanned up ON u.UserID = up.UserID
        LEFT JOIN UserMade um ON u.UserID = um.UserID
        WHERE COALESCE(up.TotalPlanned, 0) > 0
    )
    -- FINAL SELECT FROM THE WRAPPER CTE
    SELECT *
    FROM LeaderboardData
    ORDER BY
        CASE WHEN %(sort_by)s = 'accuracy' THEN AccuracyPercent END DESC,
        CASE WHEN %(sort_by)s = 'made' THEN TotalMade END DESC,
        CASE WHEN %(sort_by)s = 'planned' THEN TotalPlanned END DESC,
        TotalMade DESC
    LIMIT 100;
    """
    
    result = exec_get_all(sql, {'sort_by': sort_by})
    
    return [
        {
            'UserID': row[0],
            'FullName': row[1],
            'TotalMade': row[2],
            'TotalPlanned': row[3],
            'AccuracyPercent': f"{row[4]:.2f}%" if row[4] is not None else "0.00%"
        }
        for row in result
    ]

def get_user_dashboard_stats(user_id):
    """
    Calculates all stats for the dashboard, now using the simplified shots table.
    """
    sql = """
    WITH RECURSIVE PracticeDays AS (
        SELECT DISTINCT DATE(SessionStart) AS practice_date
        FROM practice_sessions WHERE UserID = %(user_id)s
    ),
    StreakCTE AS (
        SELECT practice_date, 1 AS streak_length FROM PracticeDays
        WHERE practice_date = (SELECT MAX(practice_date) FROM PracticeDays)
        UNION ALL
        SELECT pd.practice_date, s.streak_length + 1 FROM StreakCTE s
        JOIN PracticeDays pd ON pd.practice_date = s.practice_date - INTERVAL '1 day'
    ),
    UserPlanned AS (
        SELECT SUM(b.ShotsPlanned) AS TotalPlanned FROM practice_sessions ps
        JOIN blocks b ON ps.SessionID = b.SessionID WHERE ps.UserID = %(user_id)s
    ),
    UserMade AS (
        -- CORRECTED: Removed "AND s.Result = 'Made'"
        SELECT COUNT(s.ShotID) AS TotalMade FROM practice_sessions ps
        JOIN blocks b ON ps.SessionID = b.SessionID
        JOIN shots s ON b.BlockID = s.BlockID 
        WHERE ps.UserID = %(user_id)s
    ),
    LastSession AS (
        SELECT SessionID FROM practice_sessions
        WHERE UserID = %(user_id)s ORDER BY SessionStart DESC LIMIT 1
    ),
    LastSessionPlanned AS (
        SELECT SUM(b.ShotsPlanned) AS Planned FROM blocks b
        WHERE b.SessionID = (SELECT SessionID FROM LastSession)
    ),
    LastSessionMade AS (
        -- CORRECTED: Removed "AND s.Result = 'Made'"
        SELECT COUNT(s.ShotID) AS Made FROM blocks b
        JOIN shots s ON b.BlockID = s.BlockID
        WHERE b.SessionID = (SELECT SessionID FROM LastSession)
    )
    -- Final SELECT remains the same
    SELECT
        (SELECT CASE WHEN MAX(practice_date) >= CURRENT_DATE - INTERVAL '1 day' THEN MAX(streak_length)
                ELSE 0 END FROM StreakCTE) AS streak,
        (SELECT TotalMade FROM UserMade) AS totalMade,
        (SELECT TotalPlanned FROM UserPlanned) AS totalPlanned,
        ROUND(
            (SELECT TotalMade FROM UserMade) * 100.0 / NULLIF((SELECT TotalPlanned FROM UserPlanned), 0),
        1) AS allTimeAccuracy,
        ROUND(
            (SELECT Made FROM LastSessionMade) * 100.0 / NULLIF((SELECT Planned FROM LastSessionPlanned), 0),
        1) AS lastSessionAccuracy;
    """
    
    result = exec_get_one(sql, {'user_id': user_id})
    
    if result and result[0] is not None:
        return {
            "streak": result[0],
            "totalMade": result[1] or 0,
            "totalPlanned": result[2] or 0,
            "allTimeAccuracy": f"{result[3] or 0:.1f}%" if result[3] is not None else "N/A",
            "lastSessionAccuracy": f"{result[4] or 0:.1f}%" if result[4] is not None else "N/A"
        }
    
    return {
        "streak": 0, "totalMade": 0, "totalPlanned": 0, 
        "allTimeAccuracy": "0.0%", "lastSessionAccuracy": "N/A"
    }
if __name__ == "__main__":
    rebuild_tables()

    