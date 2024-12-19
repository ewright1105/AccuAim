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
  (3, '2024-12-03 09:00:00', '2024-12-03 10:30:00'),
  (4, '2024-12-04 16:00:00', '2024-12-04 17:00:00');

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
  (4, 19.50, 9.80, 'Made');

