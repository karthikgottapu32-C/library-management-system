const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'database', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const files = {
    'publishers.sql': `
INSERT INTO PUBLISHER (PublisherID, PublisherName, Address, Phone, Email) VALUES (1, 'Penguin Books India', 'Delhi, India', '011-23456789', 'info@penguin.in');
INSERT INTO PUBLISHER (PublisherID, PublisherName, Address, Phone, Email) VALUES (2, 'O''Reilly Media', 'California, USA', '1-800-998-9938', 'contact@oreilly.com');
INSERT INTO PUBLISHER (PublisherID, PublisherName, Address, Phone, Email) VALUES (3, 'Pearson Education', 'Noida, UP, India', '0120-4190100', 'sales@pearson.com');
INSERT INTO PUBLISHER (PublisherID, PublisherName, Address, Phone, Email) VALUES (4, 'HarperCollins', 'New York, USA', '1-800-242-7737', 'info@harpercollins.com');
COMMIT;`,

    'categories.sql': `
INSERT INTO CATEGORY (CategoryID, CategoryName, Description) VALUES (1, 'Computer Science', 'Programming, Algorithms, Databases');
INSERT INTO CATEGORY (CategoryID, CategoryName, Description) VALUES (2, 'Fiction', 'Novels, Literature, Stories');
INSERT INTO CATEGORY (CategoryID, CategoryName, Description) VALUES (3, 'Science & Nature', 'Physics, Biology, Environment');
INSERT INTO CATEGORY (CategoryID, CategoryName, Description) VALUES (4, 'History', 'World History, Indian History, Biographies');
COMMIT;`,

    'library_branches.sql': `
INSERT INTO LIBRARY_BRANCH (BranchID, BranchName, Address, Phone) VALUES (1, 'Main Campus Library', 'Block A, University Campus', '080-23456781');
INSERT INTO LIBRARY_BRANCH (BranchID, BranchName, Address, Phone) VALUES (2, 'Science Block Library', 'Block C, University Campus', '080-23456782');
COMMIT;`,

    'suppliers.sql': `
INSERT INTO SUPPLIER (SupplierID, SupplierName, Phone, Email) VALUES (1, 'National Book Distributors', '9876543210', 'sales@nbd.in');
INSERT INTO SUPPLIER (SupplierID, SupplierName, Phone, Email) VALUES (2, 'TechBooks India', '9988776655', 'orders@techbooks.com');
COMMIT;`,

    'books.sql': `
INSERT INTO BOOK (BookID, ISBN, Title, CategoryID, PublisherID, Price, Edition, PublishYear) VALUES (1, '9780132350884', 'Clean Code', 1, 3, 50.00, '1st', 2008);
INSERT INTO BOOK (BookID, ISBN, Title, CategoryID, PublisherID, Price, Edition, PublishYear) VALUES (2, '9780201485677', 'Refactoring', 1, 3, 45.00, '2nd', 2018);
INSERT INTO BOOK (BookID, ISBN, Title, CategoryID, PublisherID, Price, Edition, PublishYear) VALUES (3, '9780439708180', 'Harry Potter and the Sorcerer''s Stone', 2, 4, 20.00, '1st', 1997);
INSERT INTO BOOK (BookID, ISBN, Title, CategoryID, PublisherID, Price, Edition, PublishYear) VALUES (4, '9780073523323', 'Database System Concepts', 1, 3, 85.00, '6th', 2010);
INSERT INTO BOOK (BookID, ISBN, Title, CategoryID, PublisherID, Price, Edition, PublishYear) VALUES (5, '9780553103540', 'A Game of Thrones', 2, 1, 25.00, '1st', 1996);
COMMIT;`,

    'book_locations.sql': `
INSERT INTO BOOK_LOCATION (LocationID, LocationName, Description, BranchID) VALUES (1, 'Shelf A1', 'Computer Science Section', 1);
INSERT INTO BOOK_LOCATION (LocationID, LocationName, Description, BranchID) VALUES (2, 'Shelf B2', 'Fiction Section', 1);
INSERT INTO BOOK_LOCATION (LocationID, LocationName, Description, BranchID) VALUES (3, 'Shelf C1', 'Science & Engineering', 2);
COMMIT;`,

    'book_copies.sql': `
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (1, 1, 1, 1, 'ACC001', 'Available', 'Row 1', SYSDATE - 365);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (2, 1, 1, 1, 'ACC002', 'Issued', 'Row 1', SYSDATE - 365);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (3, 2, 1, 1, 'ACC003', 'Available', 'Row 2', SYSDATE - 200);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (4, 3, 1, 2, 'ACC004', 'Available', 'Row 1', SYSDATE - 400);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (5, 4, 2, 3, 'ACC005', 'Lost', 'Row 5', SYSDATE - 150);
INSERT INTO BOOK_COPY (CopyID, BookID, BranchID, LocationID, AccessionNo, Status, ShelfLocation, DateAcquired) VALUES (6, 5, 1, 2, 'ACC006', 'Available', 'Row 3', SYSDATE - 100);
COMMIT;`,

    'librarians.sql': `
INSERT INTO LIBRARIAN (LibrarianID, LibrarianName, Phone, Email, BranchID) VALUES (1, 'Amit Sharma', '9123456780', 'amit.sharma@library.com', 1);
INSERT INTO LIBRARIAN (LibrarianID, LibrarianName, Phone, Email, BranchID) VALUES (2, 'Neha Gupta', '9123456781', 'neha.gupta@library.com', 2);
COMMIT;`,

    'members.sql': `
INSERT INTO MEMBER (MemberID, MemberName, Address, Phone, Email, MemberType, DateJoined) VALUES (1, 'Rahul Kumar', 'Hostel A, Room 101', '9876500001', 'rahul@student.edu', 'Student', SYSDATE - 180);
INSERT INTO MEMBER (MemberID, MemberName, Address, Phone, Email, MemberType, DateJoined) VALUES (2, 'Priya Singh', 'Hostel B, Room 202', '9876500002', 'priya@student.edu', 'Student', SYSDATE - 120);
INSERT INTO MEMBER (MemberID, MemberName, Address, Phone, Email, MemberType, DateJoined) VALUES (3, 'Dr. Vikram Patel', 'Faculty Quarters, Q-12', '9876500003', 'vikram@faculty.edu', 'Faculty', SYSDATE - 800);
COMMIT;`,

    'written_by.sql': `
INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES (1, 1);
INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES (2, 2);
INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES (3, 3);
INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES (4, 5);
INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES (5, 4);
COMMIT;`,

    'loans.sql': `
INSERT INTO LOAN (LoanID, MemberID, CopyID, LibrarianID, IssueDate, DueDate, ReturnDate, Status) VALUES (1, 1, 2, 1, SYSDATE - 15, SYSDATE - 1, NULL, 'Active');
INSERT INTO LOAN (LoanID, MemberID, CopyID, LibrarianID, IssueDate, DueDate, ReturnDate, Status) VALUES (2, 2, 4, 1, SYSDATE - 30, SYSDATE - 16, SYSDATE - 15, 'Returned');
INSERT INTO LOAN (LoanID, MemberID, CopyID, LibrarianID, IssueDate, DueDate, ReturnDate, Status) VALUES (3, 3, 3, 2, SYSDATE - 20, SYSDATE - 6, NULL, 'Overdue');
COMMIT;`,

    'reservations.sql': `
INSERT INTO RESERVATION (ReservationID, MemberID, BookID, ReservationDate, Status) VALUES (1, 1, 2, SYSDATE - 5, 'Pending');
INSERT INTO RESERVATION (ReservationID, MemberID, BookID, ReservationDate, Status) VALUES (2, 2, 5, SYSDATE - 10, 'Fulfilled');
COMMIT;`,

    'fines.sql': `
INSERT INTO FINE (FineID, LoanID, MemberID, FineAmount, FineDate, FineStatus) VALUES (1, 2, 2, 10.00, SYSDATE - 15, 'Paid');
INSERT INTO FINE (FineID, LoanID, MemberID, FineAmount, FineDate, FineStatus) VALUES (2, 3, 3, 50.00, SYSDATE - 5, 'Unpaid');
COMMIT;`,

    'payments.sql': `
INSERT INTO PAYMENT (PaymentID, FineID, MemberID, Amount, PaymentDate, PaymentMode) VALUES (1, 1, 2, 10.00, SYSDATE - 14, 'Cash');
COMMIT;`
};

for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dataDir, filename), content.trim() + '\n');
}
console.log('SQL data files created successfully.');
