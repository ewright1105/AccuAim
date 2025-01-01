DROP TABLE IF EXISTS users, practice_sessions, shots; 
DROP TYPE IF EXISTS shot_result;

CREATE TYPE shot_result AS ENUM ('Made', 'Missed');

CREATE TABLE users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    FullName VARCHAR(255),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert test data into the users table
INSERT INTO users (Email, FullName)
VALUES
  ('john.doe@example.com', 'John Doe'),
  ('jane.smith@example.com', 'Jane Smith'),
  ('alice.jones@example.com', 'Alice Jones'),
  ('bob.white@example.com', 'Bob White');

CREATE TABLE practice_sessions (
    SessionID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    SessionStart TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SessionEnd TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID)
);
-- Insert test data into the practice_sessions table
INSERT INTO practice_sessions (UserID, SessionStart, SessionEnd)
VALUES
  (1, '2024-12-01 10:00:00', '2024-12-01 11:00:00'),
  (2, '2024-12-02 14:00:00', '2024-12-02 15:30:00'),
  (2, '2024-12-02 19:00:00', '2024-12-02 19:30:00'),
  (3, '2024-12-03 09:00:00', '2024-12-03 10:30:00'),
  (4, '2024-12-04 16:00:00', '2024-12-04 17:00:00'),
  (1, '2024-12-05 08:30:00', '2024-12-05 09:30:00'),
  (2, '2024-12-06 11:00:00', '2024-12-06 12:00:00'),
  (3, '2024-12-07 17:00:00', '2024-12-07 18:15:00'),
  (4, '2024-12-08 14:00:00', '2024-12-08 15:00:00'),
  (1, '2024-12-09 10:00:00', '2024-12-09 11:00:00'),
  (2, '2024-12-10 13:30:00', '2024-12-10 14:30:00'),
  (3, '2024-12-11 16:00:00', '2024-12-11 17:00:00'),
  (4, '2024-12-12 12:00:00', '2024-12-12 13:00:00'),
  (1, '2024-12-13 08:00:00', '2024-12-13 09:00:00'),
  (2, '2024-12-14 15:00:00', '2024-12-14 16:30:00');


CREATE TABLE shots (
    ShotID SERIAL PRIMARY KEY,
    SessionID INT NOT NULL,
    ShotTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ShotPositionX DECIMAL(10, 2) NOT NULL,
    ShotPositionY DECIMAL(10, 2) NOT NULL,
    Result shot_result NOT NULL,
    FOREIGN KEY (SessionID) REFERENCES practice_sessions(SessionID)
);
-- Insert test data with randomized shot positions for all 14 sessions

-- Insert test data with randomized shot positions for all 14 sessions
-- Insert test data with randomized shot positions for all 14 sessions
INSERT INTO shots (SessionID, ShotPositionX, ShotPositionY, Result)
VALUES
  -- Session 1 (4 shots: 2 Made, 2 Missed)
  (1, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (1, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (1, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (1, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 2 (5 shots: 3 Made, 2 Missed)
  (2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 3 (6 shots: 4 Made, 2 Missed)
  (3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 4 (5 shots: 2 Made, 3 Missed)
  (4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),

  -- Session 5 (4 shots: 2 Made, 2 Missed)
  (5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 6 (5 shots: 3 Made, 2 Missed)
  (6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 7 (6 shots: 4 Made, 2 Missed)
  (7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 8 (4 shots: 2 Made, 2 Missed)
  (8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),

  -- Session 9 (5 shots: 3 Made, 2 Missed)
  (9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 10 (4 shots: 2 Made, 2 Missed)
  (10, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (10, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (10, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 11 (4 shots: 2 Made, 2 Missed)
  (11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 12 (5 shots: 3 Made, 2 Missed)
  (12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 13 (3 shots: 1 Made, 2 Missed)
  (13, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (13, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (13, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),

  -- Session 14 (4 shots: 2 Made, 2 Missed)
  (14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made'),
  (14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Missed'),
  (14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), 'Made');
