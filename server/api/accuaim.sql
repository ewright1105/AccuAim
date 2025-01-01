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
-- Insert test data into the shots table
INSERT INTO shots (SessionID, ShotPositionX, ShotPositionY, Result)
VALUES
  -- Session 1 (4 shots: 2 Made, 2 Missed)
  (1, 35.50, 12.30, 'Made'),
  (1, 40.20, 15.00, 'Missed'),
  (1, 38.00, 14.00, 'Made'),
  (1, 36.00, 13.50, 'Missed'),

  -- Session 2 (5 shots: 3 Made, 2 Missed)
  (2, 50.00, 20.00, 'Made'),
  (2, 45.10, 18.40, 'Missed'),
  (2, 48.00, 19.50, 'Made'),
  (2, 46.50, 17.30, 'Made'),
  (2, 47.20, 18.00, 'Missed'),

  -- Session 3 (6 shots: 4 Made, 2 Missed)
  (3, 25.30, 10.50, 'Made'),
  (3, 30.00, 12.00, 'Made'),
  (3, 28.00, 11.50, 'Missed'),
  (3, 27.50, 11.20, 'Made'),
  (3, 29.00, 12.80, 'Made'),
  (3, 26.80, 10.70, 'Missed'),

  -- Session 4 (5 shots: 2 Made, 3 Missed)
  (4, 15.75, 8.90, 'Missed'),
  (4, 20.20, 9.50, 'Made'),
  (4, 18.00, 8.00, 'Missed'),
  (4, 17.30, 9.10, 'Missed'),
  (4, 19.50, 9.80, 'Made'),
  
  -- Session 5 (4 shots: 2 Made, 2 Missed)
  (5, 35.60, 12.40, 'Made'),
  (5, 40.00, 14.20, 'Missed'),
  (5, 38.20, 13.80, 'Made'),
  (5, 36.10, 13.60, 'Missed'),

  -- Session 6 (5 shots: 3 Made, 2 Missed)
  (6, 48.50, 19.30, 'Made'),
  (6, 45.60, 17.90, 'Missed'),
  (6, 47.00, 18.10, 'Made'),
  (6, 44.00, 16.50, 'Made'),
  (6, 45.90, 17.20, 'Missed'),

  -- Session 7 (6 shots: 4 Made, 2 Missed)
  (7, 25.60, 11.00, 'Made'),
  (7, 30.40, 12.30, 'Made'),
  (7, 28.30, 11.70, 'Missed'),
  (7, 27.00, 10.90, 'Made'),
  (7, 29.20, 12.50, 'Made'),
  (7, 26.70, 11.20, 'Missed'),

  -- Session 8 (4 shots: 2 Made, 2 Missed)
  (8, 15.90, 9.00, 'Missed'),
  (8, 20.50, 9.20, 'Made'),
  (8, 18.30, 8.60, 'Missed'),
  (8, 17.40, 9.10, 'Made'),

  -- Session 9 (5 shots: 3 Made, 2 Missed)
  (9, 35.80, 13.00, 'Made'),
  (9, 40.10, 14.40, 'Missed'),
  (9, 38.50, 13.60, 'Made'),
  (9, 36.30, 13.80, 'Missed'),
  (9, 37.20, 13.50, 'Made'),

  -- Session 10 (3 shots: 1 Made, 2 Missed)
  (10, 50.20, 20.30, 'Made'),
  (10, 45.70, 18.10, 'Missed'),
  (10, 46.00, 19.10, 'Missed'),

  -- Session 11 (6 shots: 3 Made, 3 Missed)
  (11, 28.20, 11.50, 'Made'),
  (11, 29.50, 12.60, 'Missed'),
  (11, 30.10, 12.90, 'Made'),
  (11, 27.60, 11.20, 'Missed'),
  (11, 28.80, 11.80, 'Made'),
  (11, 29.00, 12.00, 'Missed'),

  -- Session 12 (5 shots: 4 Made, 1 Missed)
  (12, 36.20, 14.00, 'Made'),
  (12, 35.90, 13.90, 'Made'),
  (12, 38.10, 14.20, 'Made'),
  (12, 37.30, 13.80, 'Made'),
  (12, 36.50, 13.70, 'Missed'),

  -- Session 13 (4 shots: 1 Made, 3 Missed)
  (13, 40.00, 15.00, 'Missed'),
  (13, 42.00, 15.50, 'Made'),
  (13, 41.00, 15.40, 'Missed'),
  (13, 43.00, 15.30, 'Missed'),

  -- Session 14 (5 shots: 2 Made, 3 Missed)
  (14, 50.50, 20.40, 'Made'),
  (14, 48.70, 19.80, 'Missed'),
  (14, 47.40, 19.00, 'Made'),
  (14, 46.30, 18.60, 'Missed'),
  (14, 45.90, 18.40, 'Missed');

