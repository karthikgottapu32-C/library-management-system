INSERT INTO FINE (FineID, LoanID, MemberID, FineAmount, FineDate, FineStatus) VALUES (1, 2, 2, 10.00, SYSDATE - 15, 'Paid');
INSERT INTO FINE (FineID, LoanID, MemberID, FineAmount, FineDate, FineStatus) VALUES (2, 3, 3, 50.00, SYSDATE - 5, 'Unpaid');
COMMIT;
