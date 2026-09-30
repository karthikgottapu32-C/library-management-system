const fs = require('fs');

const categories = [
    { name: 'Science Fiction', desc: 'Futuristic and imaginative concepts' },
    { name: 'Fantasy', desc: 'Magical and supernatural elements' },
    { name: 'Romance', desc: 'Love and relationship stories' },
    { name: 'Mystery', desc: 'Crime and puzzle solving' },
    { name: 'Thriller', desc: 'Exciting and suspenseful' },
    { name: 'Biography', desc: 'Life stories of real people' },
    { name: 'History', desc: 'Historical events and figures' },
    { name: 'Technology', desc: 'Computers and engineering' },
    { name: 'Mathematics', desc: 'Numbers, logic, and patterns' },
    { name: 'Business', desc: 'Economics, finance, and management' },
    { name: 'Self Help', desc: 'Personal development' },
    { name: 'Literature', desc: 'Classic works of literary merit' }
];

const publishers = [
    'Penguin Random House', 'HarperCollins', 'Macmillan', 'Simon & Schuster', 'Hachette Book Group',
    'Oxford University Press', 'Cambridge University Press', 'Springer', 'Wiley', 'Scholastic',
    'Pearson', 'McGraw-Hill', 'Vintage Books', 'O\'Reilly Media', 'Manning Publications'
];

const authorsFirst = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const authorsLast = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const branches = [
    { name: 'Central Library', loc: 'Downtown' },
    { name: 'Northside Branch', loc: 'North Hills' },
    { name: 'Southside Branch', loc: 'South Park' },
    { name: 'Eastside Branch', loc: 'East Valley' },
    { name: 'Westside Branch', loc: 'West End' }
];

const suppliers = [
    'Global Book Distributors', 'National Books LLC', 'Academic Suppliers Inc', 'Premium Publishing Partners',
    'Rare Books Network', 'Library Logistics', 'Speedy Books', 'Continental Suppliers', 'Local Book Depot', 'Online Books Wholesale'
];

const bookTitles = [
    'The Silent Patient', 'Where the Crawdads Sing', 'Becoming', 'Atomic Habits', 'The Alchemist',
    'Thinking, Fast and Slow', 'Sapiens', 'Educated', '1984', 'To Kill a Mockingbird',
    'The Great Gatsby', 'Pride and Prejudice', 'The Catcher in the Rye', 'Animal Farm', 'The Hobbit',
    'Fahrenheit 451', 'Jane Eyre', 'The Lord of the Rings', 'The Book Thief', 'The Hunger Games',
    'Harry Potter and the Sorcerer\'s Stone', 'The Da Vinci Code', 'The Twilight Saga', 'The Girl with the Dragon Tattoo', 'The Fault in Our Stars',
    'Gone Girl', 'The Help', 'The Handmaid\'s Tale', 'The Kite Runner', 'Water for Elephants',
    'Life of Pi', 'The Secret Life of Bees', 'The Road', 'No Country for Old Men', 'The Color Purple',
    'Beloved', 'The Joy Luck Club', 'The Grapes of Wrath', 'East of Eden', 'Of Mice and Men',
    'A Tale of Two Cities', 'Great Expectations', 'David Copperfield', 'Oliver Twist', 'Crime and Punishment',
    'The Brothers Karamazov', 'Anna Karenina', 'War and Peace', 'Madame Bovary', 'Les Miserables'
];

function r(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

let sql = `SET DEFINE OFF;\n\n`;

// 1. Categories (12)
categories.forEach(c => {
    sql += `INSERT INTO CATEGORY (CATEGORYNAME, DESCRIPTION) VALUES ('${c.name.replace(/'/g, "''")}', '${c.desc}');\n`;
});

// 2. Publishers (15)
publishers.forEach(p => {
    sql += `INSERT INTO PUBLISHER (PUBLISHERNAME, CONTACTNUMBER, ADDRESS) VALUES ('${p.replace(/'/g, "''")}', '${rInt(100,999)}-${rInt(100,999)}-${rInt(1000,9999)}', '123 Publisher Way');\n`;
});

// 3. Branches (5)
branches.forEach(b => {
    sql += `INSERT INTO LIBRARY_BRANCH (BRANCHNAME, LOCATION) VALUES ('${b.name.replace(/'/g, "''")}', '${b.loc}');\n`;
});

// 4. Suppliers (10)
suppliers.forEach(s => {
    sql += `INSERT INTO SUPPLIER (SUPPLIERNAME, PHONE, EMAIL) VALUES ('${s.replace(/'/g, "''")}', '${rInt(100,999)}-${rInt(100,999)}-${rInt(1000,9999)}', 'contact@${s.toLowerCase().replace(/ /g, '')}.com');\n`;
});

// 5. Authors (30)
for(let i=0; i<30; i++) {
    sql += `INSERT INTO AUTHOR (FIRSTNAME, LASTNAME, BIRTHYEAR) VALUES ('${r(authorsFirst)}', '${r(authorsLast)}', ${rInt(1920, 1990)});\n`;
}

// 6. Books (50)
for(let i=0; i<50; i++) {
    const title = bookTitles[i].replace(/'/g, "''");
    const isbn = '978' + rInt(1000000000, 9999999999);
    // Assumes previous max category is ~4, plus 12 = 16. Just use nested select
    sql += `INSERT INTO BOOK (TITLE, ISBN, CATEGORYID, PUBLISHERID, PRICE, EDITION, PUBLISHYEAR) 
            VALUES ('${title}', '${isbn}', 
            (SELECT MIN(CATEGORYID) + ${rInt(0, 11)} FROM CATEGORY WHERE CATEGORYID > 4), 
            (SELECT MIN(PUBLISHERID) + ${rInt(0, 14)} FROM PUBLISHER WHERE PUBLISHERID > 4), 
            ${rInt(10, 100)}, '1st', ${rInt(1990, 2023)});\n`;
}

// 7. Written By (60+)
// Link newly added books (ID > 7) with newly added authors (ID > 5)
for(let i=0; i<60; i++) {
    sql += `BEGIN
      INSERT INTO WRITTEN_BY (BOOKID, AUTHORID) VALUES (
        (SELECT MIN(BOOKID) + ${rInt(0, 49)} FROM BOOK WHERE BOOKID > 7),
        (SELECT MIN(AUTHORID) + ${rInt(0, 29)} FROM AUTHOR WHERE AUTHORID > 5)
      );
    EXCEPTION WHEN DUP_VAL_ON_INDEX THEN NULL; END;\n/\n`;
}

// 8. Book Locations (20)
for(let i=0; i<20; i++) {
    sql += `INSERT INTO BOOK_LOCATION (BRANCHID, SECTION, SHELF) VALUES (
        (SELECT MIN(BRANCHID) + ${rInt(0, 4)} FROM LIBRARY_BRANCH WHERE BRANCHID > 2),
        'Section ${String.fromCharCode(65 + rInt(0, 5))}',
        'Shelf ${rInt(1, 10)}'
    );\n`;
}

// 9. Librarians (10)
for(let i=0; i<10; i++) {
    sql += `INSERT INTO LIBRARIAN (FIRSTNAME, LASTNAME, EMAIL, HIREDATE) VALUES (
        '${r(authorsFirst)}', '${r(authorsLast)}', 'lib${i}@library.com', SYSDATE - ${rInt(100, 2000)}
    );\n`;
}

// 10. Members (100)
for(let i=0; i<100; i++) {
    sql += `INSERT INTO MEMBER (FIRSTNAME, LASTNAME, EMAIL, PHONE, MEMBERSHIPDATE) VALUES (
        '${r(authorsFirst)}', '${r(authorsLast)}', 'member${i}_${Date.now()}@mail.com', '${rInt(100,999)}-${rInt(100,999)}-${rInt(1000,9999)}', SYSDATE - ${rInt(10, 1000)}
    );\n`;
}

// 11. Book Copies (150)
for(let i=0; i<150; i++) {
    sql += `INSERT INTO BOOK_COPY (BOOKID, BRANCHID, LOCATIONID, STATUS) VALUES (
        (SELECT MIN(BOOKID) + ${rInt(0, 49)} FROM BOOK WHERE BOOKID > 7),
        (SELECT MIN(BRANCHID) + ${rInt(0, 4)} FROM LIBRARY_BRANCH WHERE BRANCHID > 2),
        (SELECT MIN(LOCATIONID) + ${rInt(0, 19)} FROM BOOK_LOCATION WHERE LOCATIONID > 3),
        'Available'
    );\n`;
}

// 12. Loans (120)
// To ensure we get valid COPYID and MEMBERID, we use subqueries.
// Note: Oracle trigger TRG_UPDATE_COPY_STATUS will automatically update BOOK_COPY status to 'Issued' (if Active) or 'Returned'
for(let i=0; i<120; i++) {
    let status = r(['Active', 'Returned', 'Overdue']);
    let returnDate = status === 'Returned' ? `SYSDATE - ${rInt(1, 30)}` : 'NULL';
    let issueDate = `SYSDATE - ${rInt(31, 100)}`;
    
    // Pick a random copy and member that were inserted above
    sql += `INSERT INTO LOAN (COPYID, MEMBERID, LOANDATE, DUEDATE, RETURNDATE, STATUS) VALUES (
        (SELECT MIN(COPYID) + ${rInt(0, 149)} FROM BOOK_COPY WHERE COPYID > 6),
        (SELECT MIN(MEMBERID) + ${rInt(0, 99)} FROM MEMBER WHERE MEMBERID > 3),
        ${issueDate},
        ${issueDate} + 14,
        ${returnDate},
        '${status}'
    );\n`;
}

// 13. Reservations (30)
for(let i=0; i<30; i++) {
    let status = r(['Pending', 'Fulfilled', 'Cancelled']);
    sql += `INSERT INTO RESERVATION (MEMBERID, BOOKID, RESERVATIONDATE, STATUS) VALUES (
        (SELECT MIN(MEMBERID) + ${rInt(0, 99)} FROM MEMBER WHERE MEMBERID > 3),
        (SELECT MIN(BOOKID) + ${rInt(0, 49)} FROM BOOK WHERE BOOKID > 7),
        SYSDATE - ${rInt(1, 30)},
        '${status}'
    );\n`;
}

// 14. Fines (30) - Tie to overdue or returned loans ideally, but we'll just link to any newly created loan.
for(let i=0; i<30; i++) {
    let status = r(['Unpaid', 'Paid']);
    sql += `INSERT INTO FINE (LOANID, FINEAMOUNT, FINESTATUS) VALUES (
        (SELECT MIN(LOANID) + ${rInt(0, 119)} FROM LOAN WHERE LOANID > 3),
        ${rInt(5, 50)},
        '${status}'
    );\n`;
}

// 15. Payments (20) - Tie to Paid fines
for(let i=0; i<20; i++) {
    sql += `INSERT INTO PAYMENT (FINEID, PAYMENTDATE, PAYMENTAMOUNT) VALUES (
        (SELECT MIN(FINEID) + ${rInt(0, 29)} FROM FINE WHERE FINEID > 2 AND FINESTATUS = 'Paid'),
        SYSDATE - ${rInt(1, 10)},
        ${rInt(5, 50)}
    );\n`;
}

sql += `\nCOMMIT;\n`;

fs.writeFileSync('database/data/seed.sql', sql);
console.log("seed.sql generated successfully!");
