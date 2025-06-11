-- DROP previous schema and types
DROP TABLE IF EXISTS shots, blocks, practice_sessions, users CASCADE;
DROP TYPE IF EXISTS shot_result, target_area;

-- ENUM type for physical target locations
CREATE TYPE target_area AS ENUM (
  'Top Right', 
  'Top Left', 
  'Bottom Right', 
  'Bottom Left', 
  'Left Hip', 
  'Right Hip', 
  'Bar Down'
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
    SessionStart TIMESTAMP NOT NULL,
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
    FOREIGN KEY (BlockID) REFERENCES blocks(BlockID) ON DELETE CASCADE
);

---
--- NEW TEST DATA ---
---

-- Users
INSERT INTO users (Email, FullName, PasswordHash) VALUES
    ('john.doe@example.com', 'John Doe', '$2b$12$wjAgXGbGsdYbHtENotwZYuZKSKRHyDcI6TUd6bcWNR4ev2/lkXYVe'),
    ('jane.smith@example.com', 'Jane Smith', '$2b$12$KTpEIOgC0.3yD6siQjifl.lys8uKQjVltS3MjoxCr5UXd6GgJjMzy'),
    ('alex.ryan@example.com', 'Alex Ryan', '$2b$12$X4RuimKINB6APQoDCg988OtIp2Md3j44uF4uQ.JmcHik1ORehT.5m');

-- Practice sessions
INSERT INTO practice_sessions (SessionID, UserID, SessionStart, SessionEnd) VALUES
    -- John Doe: Current 3-day streak. Session 3 has multiple blocks.
    (1, 1, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '1 hour'),
    (2, 1, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '1 hour'),
    (3, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 hour'), -- Most recent session for John

    -- Jane Smith: Broken streak. Session 5 has multiple blocks.
    (4, 2, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '10 days' + INTERVAL '1 hour'),
    (5, 2, CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE - INTERVAL '9 days' + INTERVAL '1 hour'), -- Most recent session for Jane

    -- Alex Ryan: No streak. Session 6 has multiple blocks.
    (6, 3, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '5 days' + INTERVAL '1 hour'); -- Most recent session for Alex
SELECT setval('practice_sessions_sessionid_seq', (SELECT MAX(SessionID) FROM practice_sessions));

-- Blocks
INSERT INTO blocks (BlockID, SessionID, TargetArea, ShotsPlanned) VALUES
    -- John Doe's simple sessions
    (1, 1, 'Top Left', 20),
    (2, 2, 'Right Hip', 15),
    
    -- John Doe's multi-block session (SessionID: 3)
    (3, 3, 'Top Right', 25),
    (4, 3, 'Left Hip', 20),
    (5, 3, 'Bar Down', 10),

    -- Jane Smith's simple session
    (6, 4, 'Bottom Left', 30),

    -- Jane Smith's multi-block session (SessionID: 5)
    (7, 5, 'Top Left', 15),
    (8, 5, 'Bottom Right', 20),
    
    -- Alex Ryan's multi-block session (SessionID: 6)
    (9, 6, 'Right Hip', 22),
    (10, 6, 'Bar Down', 18);
SELECT setval('blocks_blockid_seq', (SELECT MAX(BlockID) FROM blocks));

-- Made Shots
INSERT INTO shots (BlockID) VALUES
    -- John Doe: Made shots
    (1), (1), (1), -- 3 made for Block 1
    (2), (2), -- 2 made for Block 2
    (3), (3), (3), (3), (3), (3), (3), -- 7 made for Block 3
    (4), (4), (4), (4), -- 4 made for Block 4
    (5), (5), (5), (5), (5), (5), -- 6 made for Block 5

    -- Jane Smith: Made shots
    (6), (6), (6), (6), (6), -- 5 made for Block 6
    (7), (7), -- 2 made for Block 7
    (8), (8), (8), -- 3 made for Block 8

    -- Alex Ryan: Made shots
    (9), (9), (9), (9), (9), (9), (9), (9), -- 8 made for Block 9
    (10), (10), (10), (10), (10), (10); -- 6 made for Block 10
SELECT setval('shots_shotid_seq', (SELECT MAX(ShotID) FROM shots));