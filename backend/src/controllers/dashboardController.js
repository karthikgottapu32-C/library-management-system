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