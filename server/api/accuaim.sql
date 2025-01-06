DROP TABLE IF EXISTS users, practice_sessions, shots, target_areas, blocks; 
DROP TYPE IF EXISTS shot_result, target_area;

CREATE TYPE shot_result AS ENUM ('Made', 'Missed');

CREATE TYPE target_area AS ENUM (
  'Top Right', 
  'Top Left', 
  'Bottom Right', 
  'Bottom Left', 
  'Crossbar', 
  'Right Pipe', 
  'Left Pipe', 
  'Five Hole'
);

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
  ('john.doe@example.com', 'John Doe', '$2b$12$wjAgXGbGsdYbHtENotwZYuZKSKRHyDcI6TUd6bcWNR4ev2/lkXYVe'),
  ('jane.smith@example.com', 'Jane Smith', '$2b$12$KTpEIOgC0.3yD6siQjifl.lys8uKQjVltS3MjoxCr5UXd6GgJjMzy'),
  ('alice.jones@example.com', 'Alice Jones', '$2b$12$HG6bF5bEBQb2hBhK0JTKCuHg5U28Xs1v0MQ6rHgIMpnQmEdTePVnu'),
  ('bob.white@example.com', 'Bob White', '$2b$12$0FdZT.2lXjWgfyO3.RI2RVM9MqaNKP6tuJ0TgOk7gdTsmgW0IfI5.');

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
    BlockID INT,
    FOREIGN KEY (SessionID) REFERENCES practice_sessions(SessionID)
);
-- Insert test data with randomized shot positions for all 14 sessions
INSERT INTO shots (SessionID, ShotPositionX, ShotPositionY, Result, BlockID)
SELECT 
  SessionID,
  ShotPositionX,
  ShotPositionY,
  CASE 
    WHEN ShotPositionX >= 0 AND ShotPositionX <= 5.8 --made it 5.8 to account for pup\\
    AND ShotPositionY >= 0 AND ShotPositionY <= 5.8 THEN 'Made'::shot_result
    ELSE 'Missed'::shot_result
  END as Result,
  CASE 
    WHEN SessionID = 1 THEN 1  -- Block 1 (Top Right) for Session 1
    WHEN SessionID = 2 THEN 2  -- Block 2 (Bottom Left) for Session 2
    WHEN SessionID = 3 THEN 3  -- Block 3 (Five Hole) for Session 3
    WHEN SessionID = 4 THEN 1  -- Block 1 (Top Right) for Session 4
    WHEN SessionID = 5 THEN 2  -- Block 2 (Bottom Left) for Session 5
    WHEN SessionID = 6 THEN 3  -- Block 3 (Five Hole) for Session 6
    WHEN SessionID = 7 THEN 1  -- Block 1 (Top Right) for Session 7
    WHEN SessionID = 8 THEN 2  -- Block 2 (Bottom Left) for Session 8
    WHEN SessionID = 9 THEN 3  -- Block 3 (Five Hole) for Session 9
    WHEN SessionID = 10 THEN 1 -- Block 1 (Top Right) for Session 10
    WHEN SessionID = 11 THEN 2 -- Block 2 (Bottom Left) for Session 11
    WHEN SessionID = 12 THEN 3 -- Block 3 (Five Hole) for Session 12
    WHEN SessionID = 13 THEN 1 -- Block 1 (Top Right) for Session 13
    WHEN SessionID = 14 THEN 2 -- Block 2 (Bottom Left) for Session 14
    ELSE 1  -- Default Block ID (add more cases as needed)
  END as BlockID
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

CREATE TABLE blocks (
  BlockID SERIAL PRIMARY KEY,
  SessionID INT NOT NULL,
  TargetArea target_area NOT NULL,
  ShotsToTake INT NOT NULL, 
  FOREIGN KEY (SessionID) REFERENCES practice_sessions(SessionID)
  );
-- Insert test data into the blocks table
INSERT INTO blocks (SessionID, TargetArea, ShotsToTake)
VALUES
  -- Block 1 for Session 1
  (1, 'Top Right', 4),  -- Session 1, Top Right (4 shots)
  
  -- Block 2 for Session 2
  (2, 'Bottom Left', 5),  -- Session 2, Bottom Left (5 shots)
  
  -- Block 3 for Session 3
  (3, 'Five Hole', 6),  -- Session 3, Five Hole (6 shots)
  
  -- Block 1 for Session 4
  (4, 'Top Right', 5),  -- Session 4, Top Right (5 shots)
  
  -- Block 2 for Session 5
  (5, 'Bottom Left', 4),  -- Session 5, Bottom Left (4 shots)
  
  -- Block 3 for Session 6
  (6, 'Five Hole', 5),  -- Session 6, Five Hole (5 shots)
  
  -- Block 1 for Session 7
  (7, 'Top Right', 6),  -- Session 7, Top Right (6 shots)
  
  -- Block 2 for Session 8
  (8, 'Bottom Left', 7),  -- Session 8, Bottom Left (7 shots)
  
  -- Block 3 for Session 9
  (9, 'Five Hole', 8);  -- Session 9, Five Hole (8 shots)