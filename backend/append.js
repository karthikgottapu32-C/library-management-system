
exports.globalSearch = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.trim() === '') {
            return res.json({ success: true, data: [] });
        }
        const q = `%${query.trim()}%`;
        const qNum = parseInt(query.trim(), 10);
        let results = [];

        // Books
        let bSql = `SELECT BookID as id, Title as title, 'Book' as type, '/books' as path FROM BOOK WHERE Title ILIKE $1 OR ISBN ILIKE $1`;
        if (!isNaN(qNum)) bSql += ` OR BookID = ${qNum}`;
        bSql += ` LIMIT 5`;
        const bRes = await db.execute(bSql, [q]);
        results = results.concat(bRes.rows);

        // Members
        let mSql = `SELECT MemberID as id, MemberName as title, 'Member' as type, '/members' as path FROM MEMBER WHERE MemberName ILIKE $1 OR Email ILIKE $1 OR Phone ILIKE $1`;
        if (!isNaN(qNum)) mSql += ` OR MemberID = ${qNum}`;
        mSql += ` LIMIT 5`;
        const mRes = await db.execute(mSql, [q]);
        results = results.concat(mRes.rows);

        // Authors
        let aSql = `SELECT AuthorID as id, AuthorName as title, 'Author' as type, '/authors' as path FROM AUTHOR WHERE AuthorName ILIKE $1`;
        if (!isNaN(qNum)) aSql += ` OR AuthorID = ${qNum}`;
        aSql += ` LIMIT 5`;
        const aRes = await db.execute(aSql, [q]);
        results = results.concat(aRes.rows);

        // Categories
        let cSql = `SELECT CategoryID as id, CategoryName as title, 'Category' as type, '/categories' as path FROM CATEGORY WHERE CategoryName ILIKE $1`;
        if (!isNaN(qNum)) cSql += ` OR CategoryID = ${qNum}`;
        cSql += ` LIMIT 5`;
        const cRes = await db.execute(cSql, [q]);
        results = results.concat(cRes.rows);

        // Publishers
        let pSql = `SELECT PublisherID as id, PublisherName as title, 'Publisher' as type, '/publishers' as path FROM PUBLISHER WHERE PublisherName ILIKE $1`;
        if (!isNaN(qNum)) pSql += ` OR PublisherID = ${qNum}`;
        pSql += ` LIMIT 5`;
        const pRes = await db.execute(pSql, [q]);
        results = results.concat(pRes.rows);

        // By IDs
        if (!isNaN(qNum)) {
            const lSql = `SELECT LoanID as id, 'Loan #' || LoanID as title, 'Loan' as type, '/loans' as path FROM LOAN WHERE LoanID = $1 LIMIT 5`;
            const lRes = await db.execute(lSql, [qNum]);
            results = results.concat(lRes.rows);
            
            const fSql = `SELECT FineID as id, 'Fine #' || FineID as title, 'Fine' as type, '/fines' as path FROM FINE WHERE FineID = $1 LIMIT 5`;
            const fRes = await db.execute(fSql, [qNum]);
            results = results.concat(fRes.rows);
            
            const paySql = `SELECT PaymentID as id, 'Payment #' || PaymentID as title, 'Payment' as type, '/payments' as path FROM PAYMENT WHERE PaymentID = $1 LIMIT 5`;
            const payRes = await db.execute(paySql, [qNum]);
            results = results.concat(payRes.rows);
        }

        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
