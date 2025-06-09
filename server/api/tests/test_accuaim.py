import sys
import os
import unittest

# Add the parent directory to the path to allow direct import of modules
# This allows running the test script from the 'tests' directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Assuming your functions are in 'app_functions.py'
import accuaim_db as db
from db_utils import exec_get_one, exec_get_all

class TestAccuaimIntegration(unittest.TestCase):
    """
    Integration test suite for AccuAim functions.
    These tests run against a live PostgreSQL database and require
    the db_utils functions and a valid accuaim.sql file.
    """
    
    def setUp(self):
        """
        This method is run before each test. It rebuilds the database
        to ensure a clean and consistent state for every test.
        """
        db.rebuild_tables()
        
    # --- Block & Shot Function Tests ---
    
    def test_get_session_shots(self):
        """
        Tests retrieving all shots for a given session.
        The sample data has 6 shots in session 1 (3 in block 1, 3 in block 2).
        """
        # NOTE: Assumes get_session_shots is corrected to not cause an IndexError
        results = db.get_session_shots(1)
        self.assertEqual(6, len(results))
        # Verify that all returned shots belong to blocks from session 1 (Block IDs 1 and 2)
        self.assertTrue(all(shot["BlockID"] in [1, 2] for shot in results))

    def test_get_block_made_and_missed_shots(self):
        """
        Tests fetching made and missed shots for a specific block.
        Sample data for Block 1 has 2 made and 1 missed shot.
        """
        made_shots = db.get_block_made_shots(1)
        missed_shots = db.get_block_missed_shots(1)
        
        self.assertEqual(2, len(made_shots))
        self.assertTrue(all(shot['Result'] == 'Made' for shot in made_shots))
        
        self.assertEqual(1, len(missed_shots))
        self.assertTrue(all(shot['Result'] == 'Missed' for shot in missed_shots))

    def test_calculate_block_accuracy(self):
        """
        Tests accuracy calculation for a block.
        Block 1 (2 made / 3 total) should be 66.67%.
        Block 3 has no shots, so accuracy should be 0.00%.
        """
        # Note: This relies on get_block_made_shots and get_block_shots
        result_block1 = db.calculate_block_accuracy(1)
        self.assertEqual('66.67%', result_block1)
        
        # Test a block with no shots
        result_block3 = db.calculate_block_accuracy(3)
        self.assertEqual("0.00%", result_block3)
        
    def test_remove_shot(self):
        """
        Tests removing a shot after verifying user ownership.
        """
        # User 1 owns session 1, which contains shot 1
        shots_before = db.get_block_shots(1)
        self.assertEqual(3, len(shots_before))
        
        # Remove shot with ID 1, which belongs to user 1
        result = db.remove_shot(user_id=1, shot_id=1)
        self.assertEqual("Shot successfully removed.", result)
        
        shots_after = db.get_block_shots(1)
        self.assertEqual(2, len(shots_after))
        
        # Verify the correct shot was removed
        shot_ids_after = {shot['ShotID'] for shot in shots_after}
        self.assertNotIn(1, shot_ids_after)

    def test_remove_shot_permission_denied(self):
        """
        Tests that a user cannot remove a shot they do not own.
        """
        # User 2 tries to remove shot 1, which belongs to user 1
        result = db.remove_shot(user_id=2, shot_id=1)
        self.assertEqual("Error: Shot not found or you don't have permission to remove it.", result)
        
    # --- User & Session Function Tests ---
    
    def test_get_user_sessions(self):
        """
        Tests fetching all sessions for a specific user.
        Sample data has 1 session for user 1 and 1 session for user 2.
        """
        sessions_user1 = db.get_user_sessions(1)
        sessions_user2 = db.get_user_sessions(2)
        
        self.assertEqual(1, len(sessions_user1))
        self.assertEqual(1, sessions_user1[0][1])  # session[1] is UserID
        
        self.assertEqual(1, len(sessions_user2))
        self.assertEqual(2, sessions_user2[0][1]) # session[1] is UserID

    def test_get_all_users(self):
        """
        Tests that all users (without passwords) are retrieved.
        Sample data has 2 users.
        """
        results = db.get_all_users()
        self.assertEqual(2, len(results))
        self.assertEqual(4, len(results[0])) # Ensure password hash is not returned
        
    def test_get_user(self):
        """
        Tests retrieving a single user's public information.
        """
        user = db.get_user(1)
        self.assertEqual("john.doe@example.com", user[1])
        self.assertEqual("John Doe", user[2])
        self.assertEqual(4, len(user)) # Ensure password hash is not included in this context

    def test_create_user_and_login(self):
        """
        Tests the full user creation and login lifecycle.
        """
        # 1. Test invalid creation cases
        self.assertEqual("Error: The full name cannot be empty.", db.create_user("test@test.com", "", "pass"))
        self.assertEqual("Error: The entered email is not in the correct format.", db.create_user("bad-email", "Test", "pass"))
        
        # 2. Test successful creation
        create_result = db.create_user("new.user@example.com", "New User", "aSecurePassword123")
        self.assertEqual("User New User created successfully.", create_result)
        
        # 3. Test duplicate email creation
        duplicate_result = db.create_user("new.user@example.com", "Another User", "pass")
        self.assertEqual("Error: An account with the entered email already exists.", duplicate_result)

        # 4. Test login with correct and incorrect credentials
        login_success = db.login("new.user@example.com", "aSecurePassword123")
        self.assertIsNotNone(login_success)
        self.assertEqual("New User", login_success["name"])

        login_fail = db.login("new.user@example.com", "wrongPassword")
        self.assertIsNone(login_fail)
        
    def test_update_user(self):
        """
        Tests updating a user's name and email.
        NOTE: This test assumes the update_user function does NOT handle password changes.
        """
        # The user to update is User 1: 'john.doe@example.com'
        # The other user is User 2: 'jane.smith@example.com'
        
        # Test successful update
        result = db.update_user(1, "Johnathan Doe", "john.d@example.com")
        self.assertIn("User successfully updated", result)
        
        # Verify the update in the database
        updated_user = db.get_user(1)
        self.assertEqual("Johnathan Doe", updated_user[2])
        self.assertEqual("john.d@example.com", updated_user[1])
        
        # Test updating to a duplicate email
        result_fail = db.update_user(1, "John Doe", "jane.smith@example.com")
        self.assertEqual("Error: The new email is already in use by another user.", result_fail)

    def test_change_password(self):
        """Tests changing a user's password."""
        # User 1's password is 'password123' (from the hashed value in the sample data)
        
        # Test with incorrect current password
        fail_result = db.change_password(1, "wrong_password", "new_password")
        self.assertEqual("Error: Current password is incorrect.", fail_result)
        
        # Test successful password change
        success_result = db.change_password(1, "test123", "new_secure_password")
        self.assertEqual("Password successfully updated.", success_result)
        
        # Verify the new password works for login
        login_attempt = db.login("john.doe@example.com", "new_secure_password")
        self.assertIsNotNone(login_attempt)
        self.assertEqual(1, login_attempt['UserID'])

    def test_remove_user(self):
        """
        Tests removing a user and ensures all their associated data is also removed.
        This test relies on the database schema using `ON DELETE CASCADE`.
        """
        # 1. Create a new user with a session, block, and shot to ensure we are not deleting sample data
        db.create_user("deleteme@example.com", "Delete User", "password")
        user_id = db.get_user_id("deleteme@example.com")
        
        # Create a session and get its ID
        session_info = db.create_session(user_id, blocks=[{'targetArea': 'Top Left', 'shotsPlanned': 10}])
        session_id = session_info[0] # Assumes create_session returns the new session tuple

        # Get the new block's ID
        new_block = exec_get_one("SELECT BlockID FROM blocks WHERE SessionID = %s", (session_id,))
        block_id = new_block[0]
        
        # Add a shot to the block
        db.record_new_shot(block_id, 1, 1, 'Made')

        # 2. Test removal with incorrect password
        result_fail = db.remove_user(user_id, "wrong_password")
        self.assertEqual("Error: Incorrect password.", result_fail)
        
        # 3. Test successful removal
        result_success = db.remove_user(user_id, "password")
        self.assertIn("removed successfully", result_success)
        
        # 4. Verify all data is gone (due to ON DELETE CASCADE)
        self.assertEqual("User does not exist", db.get_user(user_id))
        self.assertIsNone(exec_get_one("SELECT * FROM practice_sessions WHERE SessionID = %s", (session_id,)))
        self.assertIsNone(exec_get_one("SELECT * FROM blocks WHERE BlockID = %s", (block_id,)))
        self.assertEqual([], exec_get_all("SELECT * FROM shots WHERE BlockID = %s", (block_id,)))


if __name__ == '__main__':
    unittest.main()