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
        self.assertTrue(all(shot[1] == 3 for shot in results)) #shot[1] == SessionID, this is making sure the shots returned are from right session

    
    def test_get_made_shots(self):
        results = get_session_made_shots(3)
        self.assertEqual(4, len(results))
        self.assertTrue(all(shot[1] == 3 for shot in results)) #shot[1] == SessionID, this is making sure the shots returned are from right session

        
    def test_get_missed_shots(self):
        results = get_session_missed_shots(3)
        self.assertEqual(2, len(results))
        self.assertTrue(all(shot[1] == 3 for shot in results)) #shot[1] == SessionID, this is making sure the shots returned are from right session

        
    def test_calculate_session_accuracy(self):
        results = calculate_session_accuracy(3)
        self.assertEqual('66.67%',results)
        
        
    def test_get_user_sessions(self):
        results1 = get_user_sessions(1)
        results2 = get_user_sessions(2)
        
        self.assertEqual(1,len(results1))
        self.assertTrue(all(session[1] == 1 for session in results1)) #session[] == UserID, this is making sure the sessions returned are from right user

        self.assertEqual(2,len(results2))
        self.assertTrue(all(session[1] == 2 for session in results2)) #session[1] == UserID, this is making sure the sessions returned are from right user
        
    def test_remove_shot(self):
        unmodified_shots = get_session_shots(1)
        results = remove_shot(1,1,3)
        modified_shots = get_session_shots(1)
        
        self.assertEqual(len(unmodified_shots)-1,len(modified_shots))
        self.assertTrue(all(shot[1] == 1 for shot in modified_shots)) #shot[1] == SessionID, this is making sure the shots returned are from right session
        self.assertEqual("Shot successfully removed.",results)
        
    def test_get_all_users(self):
        results = get_all_users()
        self.assertEqual(4,len(results))
        
    def test_get_user(self):
        results = get_user(1)
        self.assertEqual("john.doe@example.com",results[1]) #check new user has right email
        self.assertEqual("John Doe",results[2]) #check new user has right name
        
    def test_create_user(self):
        unmodified_users = get_all_users()
        
        # Test valid email and user creation
        create_result = create_user("test@gmail.com", "Test User")
        modified_users = get_all_users()
        
        self.assertEqual(len(unmodified_users) + 1, len(modified_users))  # Check user was added
        new_user = get_user(5)  # New user should be index 5
        
        self.assertEqual("test@gmail.com", new_user[1])  # Check email
        self.assertEqual("Test User", new_user[2])  # Check name
        
        # Test duplicate email
        duplicate_result = create_user("test@gmail.com", "Duplicate User")
        self.assertEqual(duplicate_result, "Error: An account with the email test@gmail.com already exists.")  # Ensure the correct error message is returned

        # Test invalid email format
        invalid_email_result = create_user("invalid-email", "Invalid User")
        self.assertEqual(invalid_email_result, "Error: The email invalid-email is not in a valid format.")  # Check error for invalid email format

    def test_get_user_id(self):
        user_exists_results = get_user_id("bob.white@example.com")
        user_DNE_results = get_user_id("test@gmail.com")
        
        self.assertEqual(4, user_exists_results)
        self.assertEqual(-1,user_DNE_results)

    def test_update_user_email(self):
        # Assuming get_user is a function that fetches user data based on user_id
        user = get_user(1)
        
        # Test valid email update
        result = update_user(1, "Updated Name", "updated.email@example.com")
        updated_user = get_user(1)
        
        self.assertNotEqual(user[1], updated_user[1])  # Check that the email has been updated
        self.assertEqual("updated.email@example.com", updated_user[1])  # Check that the new email is correct
        
        # Test invalid email format for update
        invalid_email_result = update_user(1, "Updated Name", "invalid-email")
        self.assertEqual(invalid_email_result, "Error: Invalid email format.")  # Check error for invalid email format

        # Test email duplication
        result = update_user(1, "Updated Name", "bob.white@example.com")  # Assuming this email already exists in the database
        self.assertEqual(result, "Error: The new email is already in use by another user.")  # Check duplicate email error

    def test_update_user_name(self):
        user = get_user(1)
        
        # Test valid name update
        result = update_user(1, "Updated Name", "updated.email@example.com")
        updated_user = get_user(1)
        
        self.assertNotEqual(user[2], updated_user[2])  # Check that the name has been updated
        self.assertEqual("Updated Name", updated_user[2])  # Check that the new name is correct
    
    def test_invalid_email_format(self):
        # Test invalid email format for update
        result = update_user(1, "Updated Name", "invalid-email")
        self.assertEqual(result, "Error: Invalid email format.")  # Ensure correct error message is returned

    def test_update_user_non_existent(self):
        # Test updating a non-existent user
        result = update_user(999, "newemail@example.com", "new.email@example.com")
        self.assertEqual(result, "Error: User does not exist.")  # Ensure error message is returned for non-existent user
