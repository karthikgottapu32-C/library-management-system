INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (1, 1, 1, 1, 'ACC001', 'Available', 'Row 1', SYSDATE - 365);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (2, 1, 1, 1, 'ACC002', 'Issued', 'Row 1', SYSDATE - 365);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (3, 2, 1, 1, 'ACC003', 'Available', 'Row 2', SYSDATE - 200);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (4, 3, 1, 2, 'ACC004', 'Available', 'Row 1', SYSDATE - 400);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (5, 4, 2, 3, 'ACC005', 'Lost', 'Row 5', SYSDATE - 150);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (6, 5, 1, 2, 'ACC006', 'Available', 'Row 3', SYSDATE - 100);
COMMIT;
