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
  (1, ROUND((35.50 / 100) * 6) + 1, ROUND((12.30 / 100) * 6) + 1, 'Made'),
  (1, ROUND((40.20 / 100) * 6) + 1, ROUND((15.00 / 100) * 6) + 1, 'Missed'),
  (1, ROUND((38.00 / 100) * 6) + 1, ROUND((14.00 / 100) * 6) + 1, 'Made'),
  (1, ROUND((36.00 / 100) * 6) + 1, ROUND((13.50 / 100) * 6) + 1, 'Missed'),

  -- Session 2 (5 shots: 3 Made, 2 Missed)
  (2, ROUND((50.00 / 100) * 6) + 1, ROUND((20.00 / 100) * 6) + 1, 'Made'),
  (2, ROUND((45.10 / 100) * 6) + 1, ROUND((18.40 / 100) * 6) + 1, 'Missed'),
  (2, ROUND((48.00 / 100) * 6) + 1, ROUND((19.50 / 100) * 6) + 1, 'Made'),
  (2, ROUND((46.50 / 100) * 6) + 1, ROUND((17.30 / 100) * 6) + 1, 'Made'),
  (2, ROUND((47.20 / 100) * 6) + 1, ROUND((18.00 / 100) * 6) + 1, 'Missed'),

  -- Session 3 (6 shots: 4 Made, 2 Missed)
  (3, ROUND((25.30 / 100) * 6) + 1, ROUND((10.50 / 100) * 6) + 1, 'Made'),
  (3, ROUND((30.00 / 100) * 6) + 1, ROUND((12.00 / 100) * 6) + 1, 'Made'),
  (3, ROUND((28.00 / 100) * 6) + 1, ROUND((11.50 / 100) * 6) + 1, 'Missed'),
  (3, ROUND((27.50 / 100) * 6) + 1, ROUND((11.20 / 100) * 6) + 1, 'Made'),
  (3, ROUND((29.00 / 100) * 6) + 1, ROUND((12.80 / 100) * 6) + 1, 'Made'),
  (3, ROUND((26.80 / 100) * 6) + 1, ROUND((10.70 / 100) * 6) + 1, 'Missed'),

  -- Session 4 (5 shots: 2 Made, 3 Missed)
  (4, ROUND((15.75 / 100) * 6) + 1, ROUND((8.90 / 100) * 6) + 1, 'Missed'),
  (4, ROUND((20.20 / 100) * 6) + 1, ROUND((9.50 / 100) * 6) + 1, 'Made'),
  (4, ROUND((18.00 / 100) * 6) + 1, ROUND((8.00 / 100) * 6) + 1, 'Missed'),
  (4, ROUND((17.30 / 100) * 6) + 1, ROUND((9.10 / 100) * 6) + 1, 'Missed'),
  (4, ROUND((19.50 / 100) * 6) + 1, ROUND((9.80 / 100) * 6) + 1, 'Made'),

  -- Session 5 (4 shots: 2 Made, 2 Missed)
  (5, ROUND((35.60 / 100) * 6) + 1, ROUND((12.40 / 100) * 6) + 1, 'Made'),
  (5, ROUND((40.00 / 100) * 6) + 1, ROUND((14.20 / 100) * 6) + 1, 'Missed'),
  (5, ROUND((38.20 / 100) * 6) + 1, ROUND((13.80 / 100) * 6) + 1, 'Made'),
  (5, ROUND((36.10 / 100) * 6) + 1, ROUND((13.60 / 100) * 6) + 1, 'Missed'),

  -- Session 6 (5 shots: 3 Made, 2 Missed)
  (6, ROUND((48.50 / 100) * 6) + 1, ROUND((19.30 / 100) * 6) + 1, 'Made'),
  (6, ROUND((45.60 / 100) * 6) + 1, ROUND((17.90 / 100) * 6) + 1, 'Missed'),
  (6, ROUND((47.00 / 100) * 6) + 1, ROUND((18.10 / 100) * 6) + 1, 'Made'),
  (6, ROUND((44.00 / 100) * 6) + 1, ROUND((16.50 / 100) * 6) + 1, 'Made'),
  (6, ROUND((45.90 / 100) * 6) + 1, ROUND((17.20 / 100) * 6) + 1, 'Missed'),

  -- Session 7 (6 shots: 4 Made, 2 Missed)
  (7, ROUND((25.60 / 100) * 6) + 1, ROUND((11.00 / 100) * 6) + 1, 'Made'),
  (7, ROUND((30.40 / 100) * 6) + 1, ROUND((12.30 / 100) * 6) + 1, 'Made'),
  (7, ROUND((28.30 / 100) * 6) + 1, ROUND((11.70 / 100) * 6) + 1, 'Missed'),
  (7, ROUND((27.00 / 100) * 6) + 1, ROUND((10.90 / 100) * 6) + 1, 'Made'),
  (7, ROUND((29.20 / 100) * 6) + 1, ROUND((12.50 / 100) * 6) + 1, 'Made'),
  (7, ROUND((26.70 / 100) * 6) + 1, ROUND((11.20 / 100) * 6) + 1, 'Missed'),

  -- Session 8 (4 shots: 2 Made, 2 Missed)
  (8, ROUND((15.90 / 100) * 6) + 1, ROUND((9.00 / 100) * 6) + 1, 'Missed'),
  (8, ROUND((20.50 / 100) * 6) + 1, ROUND((9.20 / 100) * 6) + 1, 'Made'),
  (8, ROUND((18.30 / 100) * 6) + 1, ROUND((8.60 / 100) * 6) + 1, 'Missed'),
  (8, ROUND((17.40 / 100) * 6) + 1, ROUND((9.10 / 100) * 6) + 1, 'Made');

  -- Session 9 (5 shots: 3 Made, 2 Missed)
  (9, ROUND((35.80 / 100) * 6) + 1, ROUND((13.00 / 100) * 6) + 1, 'Made'),
  (9, ROUND((40.10 / 100) * 6) + 1, ROUND((14.40 / 100) * 6) + 1, 'Missed'),
  (9, ROUND((38.50 / 100) * 6) + 1, ROUND((13.60 / 100) * 6) + 1, 'Made'),
  (9, ROUND((36.30 / 100) * 6) + 1, ROUND((13.80 / 100) * 6) + 1, 'Missed'),
  (9, ROUND((37.20 / 100) * 6) + 1, ROUND((13.50 / 100) * 6) + 1, 'Made'),

  -- Session 10 (3 shots: 1 Made, 2 Missed)
  (10, ROUND((50.20 / 100) * 6) + 1, ROUND((20.30 / 100) * 6) + 1, 'Made'),
  (10, ROUND((45.70 / 100) * 6) + 1, ROUND((18.10 / 100) * 6) + 1, 'Missed'),
  (10, ROUND((46.00 / 100) * 6) + 1, ROUND((19.10 / 100) * 6) + 1, 'Missed'),

  -- Session 11 (6 shots: 3 Made, 3 Missed)
  (11, ROUND((28.20 / 100) * 6) + 1, ROUND((11.50 / 100) * 6) + 1, 'Made'),
  (11, ROUND((29.50 / 100) * 6) + 1, ROUND((12.60 / 100) * 6) + 1, 'Missed'),
  (11, ROUND((30.10 / 100) * 6) + 1, ROUND((12.90 / 100) * 6) + 1, 'Made'),
  (11, ROUND((27.60 / 100) * 6) + 1, ROUND((11.20 / 100) * 6) + 1, 'Missed'),
  (11, ROUND((28.80 / 100) * 6) + 1, ROUND((11.80 / 100) * 6) + 1, 'Made'),
  (11, ROUND((29.00 / 100) * 6) + 1, ROUND((12.00 / 100) * 6) + 1, 'Missed'),

  -- Session 12 (5 shots: 4 Made, 1 Missed)
  (12, ROUND((36.20 / 100) * 6) + 1, ROUND((14.00 / 100) * 6) + 1, 'Made'),
  (12, ROUND((35.90 / 100) * 6) + 1, ROUND((13.90 / 100) * 6) + 1, 'Made'),
  (12, ROUND((38.10 / 100) * 6) + 1, ROUND((14.20 / 100) * 6) + 1, 'Made'),
  (12, ROUND((37.30 / 100) * 6) + 1, ROUND((13.80 / 100) * 6) + 1, 'Made'),
  (12, ROUND((36.50 / 100) * 6) + 1, ROUND((13.70 / 100) * 6) + 1, 'Missed'),

  -- Session 13 (4 shots: 1 Made, 3 Missed)
  (13, ROUND((40.00 / 100) * 6) + 1, ROUND((15.00 / 100) * 6) + 1, 'Missed'),
  (13, ROUND((42.00 / 100) * 6) + 1, ROUND((15.50 / 100) * 6) + 1, 'Made'),
  (13, ROUND((41.00 / 100) * 6) + 1, ROUND((15.40 / 100) * 6) + 1, 'Missed'),
  (13, ROUND((43.00 / 100) * 6) + 1, ROUND((15.30 / 100) * 6) + 1, 'Missed'),

  -- Session 14 (5 shots: 2 Made, 3 Missed)
  (14, ROUND((50.50 / 100) * 6) + 1, ROUND((20.40 / 100) * 6) + 1, 'Made'),
  (14, ROUND((48.70 / 100) * 6) + 1, ROUND((19.80 / 100) * 6) + 1, 'Missed'),
  (14, ROUND((47.40 / 100) * 6) + 1, ROUND((19.00 / 100) * 6) + 1, 'Made'),
  (14, ROUND((46.30 / 100) * 6) + 1, ROUND((18.60 / 100) * 6) + 1, 'Missed'),
  (14, ROUND((45.90 / 100) * 6) + 1, ROUND((18.40 / 100) * 6) + 1, 'Missed');
