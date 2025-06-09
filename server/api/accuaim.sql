DROP TABLE IF EXISTS users, practice_sessions, blocks, shots;
DROP TYPE IF EXISTS shot_result, target_area;

CREATE TYPE shot_result AS ENUM ('Made', 'Missed');

CREATE TYPE target_area AS ENUM (
  'Top Right', 
  'Top Left', 
  'Bottom Right', 
  'Bottom Left', 
  'Top Shelf', 
  'Right Pipe', 
  'Left Pipe', 
  'Five Hole'
);

-- Users table remains the same
CREATE TABLE users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    FullName VARCHAR(255),
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice sessions table simplified to just track session timing
CREATE TABLE practice_sessions (
    SessionID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    SessionStart TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SessionEnd TIMESTAMP,
     FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE 
);

-- Blocks table now directly related to sessions
CREATE TABLE blocks (
    BlockID SERIAL PRIMARY KEY,
    SessionID INT NOT NULL,
    TargetArea target_area NOT NULL,
    ShotsPlanned INT NOT NULL,    -- Number of shots planned for this block
    FOREIGN KEY (SessionID) REFERENCES practice_sessions(SessionID) ON DELETE CASCADE
);

-- Shots now belong to blocks instead of sessions directly
CREATE TABLE shots (
    ShotID SERIAL PRIMARY KEY,
    BlockID INT NOT NULL,
    ShotTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ShotPositionX DECIMAL(10, 2) NOT NULL,
    ShotPositionY DECIMAL(10, 2) NOT NULL,
    Result shot_result NOT NULL,
    FOREIGN KEY (BlockID) REFERENCES blocks(BlockID) ON DELETE CASCADE
);

-- Sample data for users
INSERT INTO users (Email, FullName, PasswordHash)
VALUES
    ('john.doe@example.com', 'John Doe', '$2b$12$wjAgXGbGsdYbHtENotwZYuZKSKRHyDcI6TUd6bcWNR4ev2/lkXYVe'),
    ('jane.smith@example.com', 'Jane Smith', '$2b$12$KTpEIOgC0.3yD6siQjifl.lys8uKQjVltS3MjoxCr5UXd6GgJjMzy');

-- Sample session with multiple blocks
INSERT INTO practice_sessions (UserID, SessionStart, SessionEnd)
VALUES
    (1, '2024-12-01 10:00:00', '2024-12-01 11:30:00'),
    (2, '2024-12-02 14:00:00', '2024-12-02 15:30:00');

-- Sample blocks for the sessions
INSERT INTO blocks (SessionID, TargetArea, ShotsPlanned)
VALUES
    -- Session 1 blocks
    (1, 'Top Left', 50),
    (1, 'Top Right', 50),
    -- Session 2 blocks
    (2, 'Five Hole', 30),
    (2, 'Bottom Left', 40),
    (2, 'Bottom Right', 40);

-- Sample shots for each block (just a few examples)
INSERT INTO shots (BlockID, ShotTime, ShotPositionX, ShotPositionY, Result)
VALUES
    -- Shots for Block 1 (Session 1, Top Left)
    (1, '2024-12-01 10:05:00', 2.5, 5.2, 'Made'),
    (1, '2024-12-01 10:06:00', 2.3, 6.4, 'Missed'),
    (1, '2024-12-01 10:07:00', 2.4, 5.3, 'Made'),
    
    -- Shots for Block 2 (Session 1, Top Right)
    (2, '2024-12-01 10:50:00', 5.4, 5.3, 'Made'),
    (2, '2024-12-01 10:51:00', 5.6, 5.2, 'Made'),
    (2, '2024-12-01 10:52:00', 6.5, 5.4, 'Missed');