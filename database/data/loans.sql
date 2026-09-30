INSERT INTO LOAN (LoanID, MemberID, CopyID, LibrarianID, IssueDate, DueDate, ReturnDate, Status) VALUES (1, 1, 2, 1, SYSDATE - 15, SYSDATE - 1, NULL, 'Active');
INSERT INTO LOAN (LoanID, MemberID, CopyID, LibrarianID, IssueDate, DueDate, ReturnDate, Status) VALUES (2, 2, 4, 1, SYSDATE - 30, SYSDATE - 16, SYSDATE - 15, 'Returned');
INSERT INTO LOAN (LoanID, MemberID, CopyID, LibrarianID, IssueDate, DueDate, ReturnDate, Status) VALUES (3, 3, 3, 2, SYSDATE - 20, SYSDATE - 6, NULL, 'Overdue');
COMMIT;
