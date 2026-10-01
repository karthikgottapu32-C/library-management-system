
exports.getContextStats = async (req, res) => {
    try {
        const mod = req.query.module;
        let data = {};
        if (mod === 'books') {
            const cat = await db.execute("SELECT C.CategoryName as label, COUNT(B.BookID) as value FROM CATEGORY C LEFT JOIN BOOK B ON C.CategoryID = B.CategoryID GROUP BY C.CategoryName ORDER BY value DESC LIMIT 5");
            const pop = await db.execute("SELECT B.Title as label, COUNT(L.LoanID) as value FROM BOOK B JOIN BOOK_COPY BC ON B.BookID = BC.BookID JOIN LOAN L ON BC.CopyID = L.CopyID GROUP BY B.Title ORDER BY value DESC LIMIT 5");
            data = { categories: cat.rows, popular: pop.rows };
        } else if (mod === 'authors') {
            const bpa = await db.execute("SELECT A.AuthorName as label, COUNT(DISTINCT WB.BookID) as value FROM AUTHOR A JOIN WRITTEN_BY WB ON A.AuthorID = WB.AuthorID JOIN BOOK B ON WB.BookID = B.BookID GROUP BY A.AuthorID, A.AuthorName ORDER BY value DESC LIMIT 5");
            data = { booksByAuthor: bpa.rows };
        } else if (mod === 'categories') {
            const bpc = await db.execute("SELECT C.CategoryName as label, COUNT(DISTINCT B.BookID) as value FROM CATEGORY C JOIN BOOK B ON C.CategoryID = B.CategoryID GROUP BY C.CategoryID, C.CategoryName ORDER BY value DESC LIMIT 5");
            data = { booksByCategory: bpc.rows };
        } else if (mod === 'members') {
            data = {}; // Explicitly NO analytics
        } else if (mod === 'available_copies') {
            const status = await db.execute("SELECT Status as label, COUNT(CopyID) as value FROM BOOK_COPY GROUP BY Status");
            const loc = await db.execute("SELECT L.LocationName as label, COUNT(BC.CopyID) as value FROM BOOK_LOCATION L LEFT JOIN BOOK_COPY BC ON L.LocationID = BC.LocationID WHERE BC.Status = 'Available' GROUP BY L.LocationName ORDER BY value DESC LIMIT 5");
            data = { availability: status.rows, copiesByLocation: loc.rows };
        } else if (mod === 'issued_copies') {
            const pop = await db.execute("SELECT B.Title as label, COUNT(L.LoanID) as value FROM BOOK B JOIN BOOK_COPY BC ON B.BookID = BC.BookID JOIN LOAN L ON BC.CopyID = L.CopyID WHERE L.Status = 'Active' GROUP BY B.Title ORDER BY value DESC LIMIT 5");
            data = { mostBorrowedActive: pop.rows };
        } else if (mod === 'active_loans') {
            const trend = await db.execute("SELECT TO_CHAR(IssueDate, 'YYYY-MM') as label, COUNT(*) as value FROM LOAN GROUP BY TO_CHAR(IssueDate, 'YYYY-MM') ORDER BY label DESC LIMIT 6");
            const stats = await db.execute("SELECT Status as label, COUNT(*) as value FROM LOAN GROUP BY Status");
            data = { status: stats.rows, trend: trend.rows.reverse() };
        } else if (mod === 'overdue_loans') {
            const mems = await db.execute("SELECT M.MemberName as label, COUNT(L.LoanID) as value FROM MEMBER M JOIN LOAN L ON M.MemberID = L.MemberID WHERE L.Status = 'Overdue' GROUP BY M.MemberName ORDER BY value DESC LIMIT 5");
            data = { membersWithOverdue: mems.rows };
        } else if (mod === 'unpaid_fines') {
            const paidUnpaid = await db.execute("SELECT FineStatus as label, SUM(FineAmount) as value FROM FINE GROUP BY FineStatus");
            const mems = await db.execute("SELECT M.MemberName as label, SUM(F.FineAmount) as value FROM MEMBER M JOIN LOAN L ON M.MemberID = L.MemberID JOIN FINE F ON L.LoanID = F.LoanID WHERE F.FineStatus = 'Unpaid' GROUP BY M.MemberName ORDER BY value DESC LIMIT 5");
            data = { status: paidUnpaid.rows, outstandingByMember: mems.rows };
        }
        res.json({ success: true, data });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
