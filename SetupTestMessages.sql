--Remove all memebers from all chats
DELETE FROM ChatMembers;

--Remove all messages from all chats
DELETE FROM Messages;

--Remove all chats
DELETE FROM Chats;


--Remove the user test1
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='test1@test.com');
DELETE FROM Members 
WHERE Email='test1@test.com';

--Add the User test1  (password is: test12345)
INSERT INTO 
    Members(FirstName, LastName, Username, Email)
VALUES
    ('test1First', 'test1Last', 'test1', 'test1@test.com');
INSERT INTO 
    Credentials(MemberID, SaltedHash, Salt)
VALUES
    ((SELECT MemberID from Members WHERE Email='test1@test.com'),'aafc93bbad0671a0531fa95168c4691be3a0d5e033c33a7b8be9941d2702e566', '5a3d1d9d0bda1e4855576fe486c3a188e14a3f1a381ea938cacdb8c799a3205f');


--Remove the user test2
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='test2@test.com');
DELETE FROM Members 
WHERE Email='test2@test.com';

--Add the User test2  (password is: test12345)
INSERT INTO 
    Members(FirstName, LastName, Username, Email)
VALUES
    ('test2First', 'test2Last', 'test2', 'test2@test.com');
INSERT INTO 
    Credentials(MemberID, SaltedHash, Salt)
VALUES
    ((SELECT MemberID from Members WHERE Email='test2@test.com'),'aafc93bbad0671a0531fa95168c4691be3a0d5e033c33a7b8be9941d2702e566', '5a3d1d9d0bda1e4855576fe486c3a188e14a3f1a381ea938cacdb8c799a3205f');


--Remove the user test3
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='test3@test.com');
DELETE FROM Members 
WHERE Email='test3@test.com';

--Add the User test3 (password is: test12345)
INSERT INTO 
    Members(FirstName, LastName, Username, Email)
VALUES
    ('test3First', 'test3Last', 'test3', 'test3@test.com');
INSERT INTO 
    Credentials(MemberID, SaltedHash, Salt)
VALUES
    ((SELECT MemberID from Members WHERE Email='test3@test.com'),'aafc93bbad0671a0531fa95168c4691be3a0d5e033c33a7b8be9941d2702e566', '5a3d1d9d0bda1e4855576fe486c3a188e14a3f1a381ea938cacdb8c799a3205f');



--Create Global Chat room, ChatId 0
INSERT INTO
    chats(chatid, name)
VALUES
    (0, 'Test Chat 1')
RETURNING *;

--Create Global Chat room, ChatId 1
INSERT INTO
    chats(chatid, name)
VALUES
    (1, 'Test Chat 2')
RETURNING *;

--Create Global Chat room with all current users, ChatId 2
INSERT INTO
    chats(chatid, name)
VALUES
    (2, 'Global Chat')
RETURNING *;

--Create Global Chat room with NO users, ChatId 3
INSERT INTO
    chats(chatid, name)
VALUES
    (3, 'Global Chat Empty')
RETURNING *;


--Add all users to test chat 1.
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 0, Members.MemberId
FROM Members
RETURNING *;

--Add all users to test chat 2.
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 1, Members.MemberId
FROM Members
RETURNING *;

--Add all current users into the global chat.
INSERT INTO 
    ChatMembers(ChatId, MemberId)
SELECT 2, Members.MemberId
FROM Members
RETURNING *;


--Add Message into Chat Room 3 telling to add yourself first.
INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    3, 
    'Add yourself to this chat first!',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;


--Add Multiple messages to create a conversation
INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    0, 
    'Hello Everyone!',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    0, 
    'hi',
    Members.MemberId
FROM Members
WHERE Members.Email='test2@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    1, 
    'Hey Test1, how is it going?',
    Members.MemberId
FROM Members
WHERE Members.Email='test3@test.com'
RETURNING *;

INSERT INTO 
    Messages(ChatId, Message, MemberId)
SELECT 
    1, 
    'Great, thanks for asking t3',
    Members.MemberId
FROM Members
WHERE Members.Email='test1@test.com'
RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     0, 
--     'Enough with the pleasantries',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     0, 
--     'Lets get down to business',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'CHILL out t3 lol',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test3@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'OK ok. T2, what did you do since the last meeting?',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'Nothing.',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'Im completly blocked by t3',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'Get your act together and finish the messaging end points',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'Woah now. Im waiting on t1...',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test3@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'I had a mid-term. :-(',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;


-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'But lets keep this cordial please',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'So, t2, t3 is blocking you',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     '...and Im blocking t3',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'sounds like you get another day off.',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'Nope. Im just going to do all the work myself',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'No way am I going to fail because fo you two. ',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'Ok ok. No. Charles wont be happy with that.',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'My exam is over now. Ill get cracking on this thing',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'I can knoock it out tonight',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'If I get it by tmorrow AM',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test3@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'i can finish by the aftershock',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test3@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'aftershock',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test3@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'afternoon!!! stupid autocorrect',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test3@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'Sounds like a plan',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'lets do it',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'lets dooooooo it',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test1@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     '3 2 1 Break',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test3@test.com'
-- RETURNING *;

-- INSERT INTO 
--     Messages(ChatId, Message, MemberId)
-- SELECT 
--     1, 
--     'l8r',
--     Members.MemberId
-- FROM Members
-- WHERE Members.Email='test2@test.com'

-- insert into contact test -nhat
-- INSERT INTO
--     Contacts(MemberID_A, MemberID_B)
--     VALUES(133, 132)
-- RETURNING *;