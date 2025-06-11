-- DROP previous schema and types
DROP TABLE IF EXISTS shots, blocks, practice_sessions, users CASCADE;
DROP TYPE IF EXISTS shot_result, target_area;

-- ENUM types
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

-- Users table
CREATE TABLE users (
    UserID SERIAL PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    FullName VARCHAR(255),
    PasswordHash VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice sessions table
CREATE TABLE practice_sessions (
    SessionID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    SessionStart TIMESTAMP NOT NULL, -- Removed default for explicit setting
    SessionEnd TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE 
);

-- Blocks table
CREATE TABLE blocks (
    BlockID SERIAL PRIMARY KEY,
    SessionID INT NOT NULL,
    TargetArea target_area NOT NULL,
    ShotsPlanned INT NOT NULL,
    FOREIGN KEY (SessionID) REFERENCES practice_sessions(SessionID) ON DELETE CASCADE
);

-- Shots table
CREATE TABLE shots (
    ShotID SERIAL PRIMARY KEY,
    BlockID INT NOT NULL,
    ShotTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ShotPositionX DECIMAL(10, 2) NOT NULL,
    ShotPositionY DECIMAL(10, 2) NOT NULL,
    Result shot_result NOT NULL,
    FOREIGN KEY (BlockID) REFERENCES blocks(BlockID) ON DELETE CASCADE
);

-- Users
INSERT INTO users (Email, FullName, PasswordHash) VALUES
    ('john.doe@example.com', 'John Doe', '$2b$12$wjAgXGbGsdYbHtENotwZYuZKSKRHyDcI6TUd6bcWNR4ev2/lkXYVe'),
    ('jane.smith@example.com', 'Jane Smith', '$2b$12$KTpEIOgC0.3yD6siQjifl.lys8uKQjVltS3MjoxCr5UXd6GgJjMzy'),
    ('alex.ryan@example.com', 'Alex Ryan', '$2b$12$X4RuimKINB6APQoDCg988OtIp2Md3j44uF4uQ.JmcHik1ORehT.5m');

-- Practice sessions (Dates are now relative to CURRENT_DATE to test streak logic)
INSERT INTO practice_sessions (SessionID, UserID, SessionStart, SessionEnd) VALUES
    -- John Doe: Sessions for a 3-day streak (today, yesterday, day before) plus a broken session
    (1, 1, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '1 hour'),
    (2, 1, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '1 hour'),
    (3, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 hour'),
    (4, 1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days' + INTERVAL '1 hour'), -- Breaks the streak

    -- Jane Smith: A 2-day streak, but it's old, so her current streak should be 0
    (5, 2, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days' + INTERVAL '1 hour'),
    (6, 2, CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE - INTERVAL '9 days' + INTERVAL '1 hour'),

    -- Alex Ryan: Only one old session, so streak is 0
    (7, 3, CURRENT_DATE - INTERVAL '2 hours', CURRENT_DATE - INTERVAL '1 hour');

-- Manually set sequence for practice_sessions primary key
SELECT setval('practice_sessions_sessionid_seq', (SELECT MAX(SessionID) FROM practice_sessions));


-- Blocks
INSERT INTO blocks (BlockID, SessionID, TargetArea, ShotsPlanned) VALUES
    -- John Doe's sessions
    (1, 1, 'Top Left', 20),
    (2, 2, 'Top Right', 20),
    (3, 3, 'Five Hole', 20),
    (4, 4, 'Bottom Left', 20),

    -- Jane Smith's sessions
    (5, 5, 'Bottom Right', 25),
    (6, 6, 'Top Shelf', 25),

    -- Alex Ryan's session
    (7, 7, 'Right Pipe', 30);

-- Manually set sequence for blocks primary key
SELECT setval('blocks_blockid_seq', (SELECT MAX(BlockID) FROM blocks));


-- Shots
INSERT INTO shots (BlockID, Result, ShotPositionX, ShotPositionY) VALUES
    -- John Doe's shots
    (1, 'Made', 2.5, 5.2), (1, 'Missed', 2.3, 6.4),
    (2, 'Made', 5.4, 5.3), (2, 'Made', 5.6, 5.2),
    (3, 'Made', 1.2, 3.4), (3, 'Missed', 1.3, 3.5),
    (4, 'Made', 0.9, 2.4),

    -- Jane Smith's shots
    (5, 'Made', 4.2, 1.2), (5, 'Made', 4.5, 1.4),
    (6, 'Missed', 6.2, 8.1), (6, 'Made', 6.3, 8.3),

    -- Alex Ryan's shots
    (7, 'Made', 3.2, 2.2), (7, 'Missed', 3.6, 2.5);

-- Manually set sequence for shots primary key
SELECT setval('shots_shotid_seq', (SELECT MAX(ShotID) FROM shots));