DROP TABLE IF EXISTS users, practice_sessions, shots; 
DROP TYPE IF EXISTS shot_result;

CREATE TYPE shot_result AS ENUM ('Made', 'Missed');

CREATE TABLE users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    FullName VARCHAR(255),
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert test data into the users table
INSERT INTO users (Email, FullName, PasswordHash)
VALUES
  ('john.doe@example.com', 'John Doe', '$2a$12$EVVpQjkwDqTQCk2JtKvZz.kPfn9TgtZEG1XVrW8vS1tqx8POA2F7C'),
  ('jane.smith@example.com', 'Jane Smith', '$2a$12$EVVpQjkwDqTQCk2JtKvZz.kPfn9TgtZEG1XVrW8vS1tqx8POA2F7C'),
  ('alice.jones@example.com', 'Alice Jones', '$2a$12$5oVxxkjogqfGv27lVQWISuoIbgL1P0mhVu0jcQoxFZoHZsTH27e5K'),
  ('bob.white@example.com', 'Bob White', '$2a$12$7ECRX42XN6z6ql9h1Vml9ObcdqzAY0qZhNcZbyP/m7fXfohSxgMWu');

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
INSERT INTO shots (SessionID, ShotPositionX, ShotPositionY, Result)
SELECT 
  SessionID,
  ShotPositionX,
  ShotPositionY,
  CASE 
  WHEN ShotPositionX >= 0 AND ShotPositionX <= 5.8 --made it 5.8 to account for pup\\
   AND ShotPositionY >= 0 AND ShotPositionY <= 5.8 THEN 'Made'::shot_result
  ELSE 'Missed'::shot_result
END as Result
FROM (
  -- Session 1 (4 shots)
  SELECT 1 as SessionID, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2) as ShotPositionX, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2) as ShotPositionY
  UNION ALL SELECT 1, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 1, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 1, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 2 (5 shots)
  UNION ALL SELECT 2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 2, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 3 (6 shots)
  UNION ALL SELECT 3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 3, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 4 (5 shots)
  UNION ALL SELECT 4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 4, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 5 (4 shots)
  UNION ALL SELECT 5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 5, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 6 (5 shots)
  UNION ALL SELECT 6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 6, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 7 (6 shots)
  UNION ALL SELECT 7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 7, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 8 (4 shots)
  UNION ALL SELECT 8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 8, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 9 (5 shots)
  UNION ALL SELECT 9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 9, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 10 (3 shots)
  UNION ALL SELECT 10, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 10, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 10, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 11 (4 shots)
  UNION ALL SELECT 11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 11, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 12 (5 shots)
  UNION ALL SELECT 12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 12, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 13 (3 shots)
  UNION ALL SELECT 13, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 13, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 13, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)

  -- Session 14 (4 shots)
  UNION ALL SELECT 14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
  UNION ALL SELECT 14, ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2), ROUND(CAST(RANDOM() * 6 + 1 AS numeric), 2)
) AS shots_data;