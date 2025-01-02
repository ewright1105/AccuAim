import sys
import os

# Add the parent directory of the package to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from accuaim_db import *
from db_utils import *

class TestAccuaim (unittest.TestCase):
    def setUp(self):
        rebuild_tables()
        
    def test_get_session_shots(self):
        results = get_session_shots(3)
        self.assertEqual(6,len(results))
        self.assertTrue(all(shot["SessionID"] == 3 for shot in results)) #shot[1] == SessionID, this is making sure the shots returned are from right session

    
    # def test_get_made_shots(self):
    #     results = get_session_made_shots(3)
    #     self.assertEqual(3, len(results))
    #     self.assertTrue(all(shot[1] == 3 for shot in results)) #shot[1] == SessionID, this is making sure the shots returned are from right session

        
    # def test_get_missed_shots(self):
    #     results = get_session_missed_shots(3)
    #     self.assertEqual(2, len(results))
    #     self.assertTrue(all(shot[1] == 3 for shot in results)) #shot[1] == SessionID, this is making sure the shots returned are from right session

        
    # def test_calculate_session_accuracy(self):
    #     results = calculate_session_accuracy(3)
    #     self.assertEqual('66.67%',results)
        
        
    def test_get_user_sessions(self):
        results1 = get_user_sessions(1)
        results2 = get_user_sessions(2)
        
        self.assertEqual(4,len(results1))
        self.assertTrue(all(session[1] == 1 for session in results1)) #session[] == UserID, this is making sure the sessions returned are from right user

        self.assertEqual(5,len(results2))
        self.assertTrue(all(session[1] == 2 for session in results2)) #session[1] == UserID, this is making sure the sessions returned are from right user
        
    def test_remove_shot(self):
        unmodified_shots = get_session_shots(1)
        results = remove_shot(1,1,3)
        modified_shots = get_session_shots(1)
        
        self.assertEqual(len(unmodified_shots)-1,len(modified_shots))
        self.assertTrue(all(shot["SessionID"] == 1 for shot in modified_shots)) #shot[1] == SessionID, this is making sure the shots returned are from right session
        self.assertEqual("Shot successfully removed.",results)
        
    def test_get_all_users(self):
        results = get_all_users()
        self.assertEqual(4,len(results))
        self.assertEqual(4,len(results[0])) #make sure does not include password
        
    def test_get_user(self):
        results = get_user(1)
        self.assertEqual("john.doe@example.com",results[1]) #check new user has right email
        self.assertEqual("John Doe",results[2]) #check new user has right name
        self.assertEqual(4,len(results)) #make sure password is not included
        
    def test_create_user(self):
        unmodified_users = get_all_users()
        
        # Test valid user creation with password
        create_result = create_user("test@gmail.com", "Test User", "SecurePass123!")
        modified_users = get_all_users()
        
        self.assertEqual(len(unmodified_users) + 1, len(modified_users))
        
        # Verify user was created with correct credentials
        verify_result = verify_user("test@gmail.com", "SecurePass123!")
        self.assertIsNotNone(verify_result)
        self.assertEqual("Test User", verify_result["name"])
        
        # Test duplicate email
        duplicate_result = create_user("test@gmail.com", "Duplicate User", "AnotherPass123!")
        self.assertEqual(duplicate_result, "Error: An account with the entered email already exists.")

        # Test invalid email format
        invalid_email_result = create_user("invalid-email", "Invalid User", "Pass123!")
        self.assertEqual(invalid_email_result, "Error: The entered email is not in the correct format.")
        
    def test_verify_user(self):
        # Create a test user
        create_user("verify@test.com", "Verify User", "TestPass123!")
        
        # Test correct password
        result = verify_user("verify@test.com", "TestPass123!")
        self.assertIsNotNone(result)
        self.assertEqual("Verify User", result["name"])
        
        # Test incorrect password
        result = verify_user("verify@test.com", "WrongPass123!")
        self.assertIsNone(result)
        
        # Test non-existent user
        result = verify_user("nonexistent@test.com", "TestPass123!")

    def test_get_user_id(self):
        user_exists_results = get_user_id("bob.white@example.com")
        user_DNE_results = get_user_id("test@gmail.com")
        
        self.assertEqual(4, user_exists_results)
        self.assertEqual(-1,user_DNE_results)

    def test_update_user(self):
        # Create a test user
        create_user("update@test.com", "Update User", "OldPass123!")
        user_id = get_user_id("update@test.com")
        
        # Test updating without password change
        result = update_user(user_id, "Updated Name", "still.update@test.com")
        self.assertTrue("successfully updated" in result)
        
        # Test updating with password change
        result = update_user(user_id, "Updated Name", "new.update@test.com", 
                           "OldPass123!", "NewPass123!")
        self.assertTrue("successfully updated" in result)
        
        # Verify new password works
        verify_result = verify_user("new.update@test.com", "NewPass123!")
        self.assertIsNotNone(verify_result)
        
        # Test updating with incorrect current password
        result = update_user(user_id, "Updated Name", "new.update@test.com", 
                           "WrongPass123!", "NewerPass123!")
        self.assertEqual(result, "Error: Current password is incorrect.")
        
    def test_change_password(self):
        # Create a test user
        create_user("password@test.com", "Password User", "OldPass123!")
        user_id = get_user_id("password@test.com")
        
        # Test successful password change
        result = change_password(user_id, "OldPass123!", "NewPass123!")
        self.assertEqual(result, "Password successfully updated.")
        
        # Verify new password works
        verify_result = verify_user("password@test.com", "NewPass123!")
        self.assertIsNotNone(verify_result)
        
        # Test with incorrect current password
        result = change_password(user_id, "WrongPass123!", "NewerPass123!")
        self.assertEqual(result, "Error: Current password is incorrect.")
        
        
    def test_invalid_email_format(self):
        # Test invalid email format for update
        result = update_user(1, "Updated Name", "invalid-email")
        self.assertEqual(result, "Error: Invalid email format.")  # Ensure correct error message is returned

    def test_update_user_non_existent(self):
        # Test updating a non-existent user
        result = update_user(999, "newemail@example.com", "new.email@example.com")
        self.assertEqual(result, "Error: User does not exist.")  # Ensure error message is returned for non-existent user

    def test_get_session_data_invalid_session(self):
        # Try to get session data for a session that doesn't exist or doesn't belong to the user
        invalid_session_data = get_session_data(1, 999)  # User 1 trying to access session 999
        self.assertIn("error", invalid_session_data)
        self.assertEqual(invalid_session_data["error"], "This session does not belong to the user or does not exist.")

    def test_calculate_session_accuracy_no_shots(self):
        # Test a session with no shots at all
        results = calculate_session_accuracy(999)  # Assuming session 999 has no shots
        self.assertEqual('0.00%', results)

    def test_remove_shot_invalid(self):
        # Try removing a shot from a session that does not belong to the user
        result = remove_shot(1, 999, 1000)  # User 1 trying to remove shot 1000 from session 999
        self.assertEqual(result, "Error: The specified session does not belong to the user.")

    def test_update_user_email_duplicate(self):
        # Test that updating user email to one that already exists fails
        result = update_user(1, "John Doe", "bob.white@example.com")
        self.assertEqual(result, "Error: The new email is already in use by another user.")

    def test_create_user_invalid_name(self):
        # Create a user with an empty name
        result = create_user("test_invalid_name@example.com", "", "password123")
        self.assertEqual(result, "Error: The full name cannot be empty.")

    def test_remove_user(self):
        # Create a test user
        create_user("remove@test.com", "Remove User", "RemovePass123!")
        user_id = get_user_id("remove@test.com")
        
        # Test removal with incorrect password
        result = remove_user(user_id, "WrongPass123!")
        self.assertEqual(result, "Error: Incorrect password.")
        
        # Test successful removal
        result = remove_user(user_id, "RemovePass123!")
        self.assertEqual(result, "User with ID " + str(user_id) + " and all associated records removed successfully.")
        
        # Verify user no longer exists
        self.assertEqual(get_user(user_id), "User does not exist")
        
    def test_create_user_email_with_spaces(self):
        # Test email with leading/trailing spaces
        result = create_user(" test@example.com ", "John Doe", "password123")
        self.assertEqual(result, "Error: The entered email is not in the correct format.")  # Assuming you're trimming spaces in email validation
        
    # def test_reorder_shots_after_removal(self):
    #     unmodified_shots = get_session_shots(3)
    #     shot_to_remove = unmodified_shots[0][0]  # Get the first shot ID

    #     remove_result = remove_shot(1, 1, shot_to_remove)  # Remove the shot
    #     self.assertEqual(remove_result, "Shot successfully removed.")
        
    #     modified_shots = get_session_shots(1)
    #     self.assertTrue(all(modified_shots[i][0] == i + 1 for i in range(len(modified_shots))))  # Ensure the ShotIDs are sequential after removal
