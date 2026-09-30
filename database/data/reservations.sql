INSERT INTO RESERVATION (ReservationID, MemberID, BookID, ReservationDate, Status) VALUES (1, 1, 2, SYSDATE - 5, 'Pending');
INSERT INTO RESERVATION (ReservationID, MemberID, BookID, ReservationDate, Status) VALUES (2, 2, 5, SYSDATE - 10, 'Fulfilled');
COMMIT;
