import sys
import os

# Add the parent directory of the package to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import unittest
from src.accuaim_db import *
from src.db_utils import *

class TestAccuaim (unittest.TestCase):
    def setUp(self):
        rebuild_tables()
        
    def test_get_session_shots(self):
        results = get_session_shots(3)
        self.assertEqual(6,len(results))
    
    def test_get_made_shots(self):
        results = get_session_made_shots(3)
        self.assertEqual(4, len(results))
        
    def test_get_missed_shots(self):
        results = get_session_missed_shots(3)
        self.assertEqual(2, len(results))
        
    def test_calculate_session_accuracy(self):
        results = calculate_session_accuracy(3)
        self.assertEqual('66.67%',results)
