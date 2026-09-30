INSERT INTO MEMBER (MemberID, MemberName, Address, Phone, Email, MemberType, DateJoined) VALUES (1, 'Rahul Kumar', 'Hostel A, Room 101', '9876500001', 'rahul@student.edu', 'Student', SYSDATE - 180);
INSERT INTO MEMBER (MemberID, MemberName, Address, Phone, Email, MemberType, DateJoined) VALUES (2, 'Priya Singh', 'Hostel B, Room 202', '9876500002', 'priya@student.edu', 'Student', SYSDATE - 120);
INSERT INTO MEMBER (MemberID, MemberName, Address, Phone, Email, MemberType, DateJoined) VALUES (3, 'Dr. Vikram Patel', 'Faculty Quarters, Q-12', '9876500003', 'vikram@faculty.edu', 'Faculty', SYSDATE - 800);
COMMIT;
