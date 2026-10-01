const db = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        const queries = {
            totalBooks:          "SELECT COUNT(*) AS VAL FROM BOOK",
            totalBookCopies:     "SELECT COUNT(*) AS VAL FROM BOOK_COPY",
            availableCopies:     "SELECT COUNT(*) AS VAL FROM BOOK_COPY WHERE STATUS = 'Available'",
            issuedCopies:        "SELECT COUNT(*) AS VAL FROM BOOK_COPY WHERE STATUS = 'Issued'",
            totalMembers:        "SELECT COUNT(*) AS VAL FROM MEMBER",
            activeLoans:         "SELECT COUNT(*) AS VAL FROM LOAN WHERE STATUS = 'Active'",
            overdueLoans:        "SELECT COUNT(*) AS VAL FROM LOAN WHERE STATUS = 'Overdue'",
            returnedLoans:       "SELECT COUNT(*) AS VAL FROM LOAN WHERE STATUS = 'Returned'",
            activeReservations:  "SELECT COUNT(*) AS VAL FROM RESERVATION WHERE STATUS = 'Pending'",
            outstandingFines:    "SELECT COUNT(*) AS VAL FROM FINE WHERE FINESTATUS = 'Unpaid'",
            totalAuthors:        "SELECT COUNT(*) AS VAL FROM AUTHOR",
            totalPublishers:     "SELECT COUNT(*) AS VAL FROM PUBLISHER",
            totalBranches:       "SELECT COUNT(*) AS VAL FROM LIBRARY_BRANCH",
            totalSuppliers:      "SELECT COUNT(*) AS VAL FROM SUPPLIER"
        };
        const stats = {};
        for (const [key, sql] of Object.entries(queries)) {
            const result = await db.execute(sql);
            stats[key] = result.rows[0] ? result.rows[0].VAL : 0;
        }
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecentLoans = async (req, res) => {
    try {
        const result = await db.execute(
            "SELECT LOANID, MEMBERID, COPYID, ISSUEDATE, DUEDATE, RETURNDATE, STATUS FROM LOAN ORDER BY LOANID DESC LIMIT 10"
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecentReservations = async (req, res) => {
    try {
        const result = await db.execute(
            "SELECT * FROM RESERVATION ORDER BY RESERVATIONDATE DESC LIMIT 10"
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecentBooks = async (req, res) => {
    try {
        const result = await db.execute(
            "SELECT BOOKID, TITLE, ISBN, PUBLISHYEAR FROM BOOK ORDER BY BOOKID DESC LIMIT 10"
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOverdueLoans = async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM LOAN WHERE STATUS = 'Overdue' LIMIT 20");
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getContextStats = async (req, res) => {
    try {
        const mod = req.query.module;
        let data = {};
        if (mod === 'books') {
            const cat = await db.execute("SELECT C.CategoryName as label, COUNT(B.BookID) as value FROM CATEGORY C LEFT JOIN BOOK B ON C.CategoryID = B.CategoryID GROUP BY C.CategoryName ORDER BY value DESC LIMIT 5");
            const pop = await db.execute("SELECT B.Title as label, COUNT(L.LoanID) as value FROM BOOK B JOIN BOOK_COPY BC ON B.BookID = BC.BookID JOIN LOAN L ON BC.CopyID = L.CopyID GROUP BY B.Title ORDER BY value DESC LIMIT 5");
            data = { categories: cat.rows, popular: pop.rows };
        } else if (mod === 'authors') {
            const bpa = await db.execute("SELECT A.AuthorName as label, COUNT(WB.BookID) as value FROM AUTHOR A LEFT JOIN WRITTEN_BY WB ON A.AuthorID = WB.AuthorID GROUP BY A.AuthorName ORDER BY value DESC LIMIT 5");
            data = { booksPerAuthor: bpa.rows };
        } else if (mod === 'book-copies') {
            const loc = await db.execute("SELECT L.LocationName as label, COUNT(BC.CopyID) as value FROM BOOK_LOCATION L LEFT JOIN BOOK_COPY BC ON L.LocationID = BC.LocationID GROUP BY L.LocationName ORDER BY value DESC LIMIT 5");
            data = { locations: loc.rows };
        } else if (mod === 'members') {
            const memLoans = await db.execute("SELECT M.MemberName as label, COUNT(L.LoanID) as value FROM MEMBER M JOIN LOAN L ON M.MemberID = L.MemberID GROUP BY M.MemberName ORDER BY value DESC LIMIT 5");
            data = { memberLoans: memLoans.rows };
        } else if (mod === 'loans') {
            const trend = await db.execute("SELECT TO_CHAR(IssueDate, 'YYYY-MM') as label, COUNT(*) as value FROM LOAN GROUP BY TO_CHAR(IssueDate, 'YYYY-MM') ORDER BY label DESC LIMIT 6");
            data = { trend: trend.rows.reverse() };
        } else if (mod === 'fines') {
            const paidUnpaid = await db.execute("SELECT FineStatus as label, SUM(FineAmount) as value FROM FINE GROUP BY FineStatus");
            data = { status: paidUnpaid.rows };
        } else if (mod === 'payments') {
            const modes = await db.execute("SELECT PaymentMode as label, SUM(Amount) as value FROM PAYMENT GROUP BY PaymentMode");
            data = { modes: modes.rows };
        }
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
