const db = require('../config/database');

exports.getBooks = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        let binds = [limit, offset];
        let paramIndex = 3;

        if (req.query.search) {
            whereClause += ` AND (B.Title ILIKE $${paramIndex} OR B.ISBN ILIKE $${paramIndex} OR C.CategoryName ILIKE $${paramIndex} OR A.AuthorName ILIKE $${paramIndex})`;
            binds.push(`%${req.query.search}%`);
            paramIndex++;
        }

        if (req.query.CATEGORYID) {
            whereClause += ` AND B.CategoryID = $${paramIndex}`;
            binds.push(req.query.CATEGORYID);
            paramIndex++;
        }

        const sql = `
            SELECT 
                B.BookID AS BOOKID, B.ISBN, B.Title AS TITLE, B.CategoryID AS CATEGORYID, B.PublisherID AS PUBLISHERID, B.Price AS PRICE, B.Edition AS EDITION, B.PublishYear AS PUBLISHYEAR, 
                STRING_AGG(A.AuthorName, ', ') AS AUTHOR_NAMES,
                C.CategoryName AS CATEGORYNAME,
                P.PublisherName AS PUBLISHERNAME
            FROM BOOK B
            LEFT JOIN WRITTEN_BY WB ON B.BookID = WB.BookID
            LEFT JOIN AUTHOR A ON WB.AuthorID = A.AuthorID
            LEFT JOIN CATEGORY C ON B.CategoryID = C.CategoryID
            LEFT JOIN PUBLISHER P ON B.PublisherID = P.PublisherID
            ${whereClause}
            GROUP BY B.BookID, C.CategoryName, P.PublisherName
            ORDER BY B.BookID DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.execute(sql, binds);
        res.json({ success: true, data: result.rows, page, limit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAuthors = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
        const offset = (page - 1) * limit;

        let whereClause = '';
        let binds = [limit, offset];
        
        if (req.query.search) {
            whereClause = `WHERE A.AuthorName ILIKE $3`;
            binds.push(`%${req.query.search}%`);
        }

        const sql = `
            SELECT 
                A.AuthorID AS AUTHORID, A.AuthorName AS AUTHORNAME, A.Nationality AS NATIONALITY, A.Biography AS BIOGRAPHY, 
                STRING_AGG(B.Title, ', ') AS BOOK_TITLES
            FROM AUTHOR A
            LEFT JOIN WRITTEN_BY WB ON A.AuthorID = WB.AuthorID
            LEFT JOIN BOOK B ON WB.BookID = B.BookID
            ${whereClause}
            GROUP BY A.AuthorID
            ORDER BY A.AuthorID DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.execute(sql, binds);
        res.json({ success: true, data: result.rows, page, limit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublishers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
        const offset = (page - 1) * limit;

        let whereClause = '';
        let binds = [limit, offset];
        
        if (req.query.search) {
            whereClause = `WHERE P.PublisherName ILIKE $3`;
            binds.push(`%${req.query.search}%`);
        }

        const sql = `
            SELECT 
                P.PublisherID AS PUBLISHERID, P.PublisherName AS PUBLISHERNAME, P.Phone AS PHONE, P.Email AS EMAIL, P.Address AS ADDRESS, 
                STRING_AGG(B.Title, ', ') AS BOOKS_PUBLISHED
            FROM PUBLISHER P
            LEFT JOIN BOOK B ON P.PublisherID = B.PublisherID
            ${whereClause}
            GROUP BY P.PublisherID
            ORDER BY P.PublisherID DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.execute(sql, binds);
        res.json({ success: true, data: result.rows, page, limit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

async function getOrCreateCategory(categoryName) {
    if (!categoryName) return null;
    const searchSql = `SELECT CategoryID FROM CATEGORY WHERE CategoryName ILIKE $1`;
    const searchRes = await db.execute(searchSql, [categoryName.trim()]);
    if (searchRes.rows.length > 0) {
        return searchRes.rows[0].CATEGORYID || searchRes.rows[0].categoryid;
    }
    const insertSql = `INSERT INTO CATEGORY (CategoryName) VALUES ($1) RETURNING CategoryID`;
    const insertRes = await db.execute(insertSql, [categoryName.trim()]);
    return insertRes.rows[0].CATEGORYID || insertRes.rows[0].categoryid;
}

exports.createBook = async (req, res, next) => {
    const authorIdsStr = req.body.AUTHOR_IDS;
    delete req.body.AUTHOR_IDS; 
    
    try {
        const title = req.body.TITLE;
        const isbn = req.body.ISBN || null;
        let catId = req.body.CATEGORYID || null;
        const pubId = req.body.PUBLISHERID || null;
        const price = req.body.PRICE || null;
        const edition = req.body.EDITION || null;
        const year = req.body.PUBLISHYEAR || null;

        // Auto-create category if CATEGORYNAME is provided instead of ID
        if (req.body.CATEGORYNAME) {
            catId = await getOrCreateCategory(req.body.CATEGORYNAME);
        }

        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

        const insertSql = `
            INSERT INTO BOOK (ISBN, Title, CategoryID, PublisherID, Price, Edition, PublishYear)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING BookID
        `;
        const result = await db.execute(insertSql, [isbn, title, catId, pubId, price, edition, year]);
        const newBookId = result.rows[0].BOOKID || result.rows[0].bookid;

        if (authorIdsStr) {
            const authorIds = authorIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            for (const aId of authorIds) {
                await db.execute('INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newBookId, aId]);
            }
        }

        res.status(201).json({ success: true, data: { inserted: 1, record: { BOOKID: newBookId } } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateBook = async (req, res, next) => {
    const authorIdsStr = req.body.AUTHOR_IDS;
    delete req.body.AUTHOR_IDS; 
    const bookId = req.params.id;

    try {
        if (req.body.CATEGORYNAME) {
            req.body.CATEGORYID = await getOrCreateCategory(req.body.CATEGORYNAME);
            delete req.body.CATEGORYNAME;
        }

        const keys = Object.keys(req.body);
        if (keys.length > 0) {
            const vals = [];
            const setParts = keys.map((k, i) => {
                vals.push(req.body[k]);
                return `${k} = $${i + 1}`;
            });
            vals.push(bookId);
            const sql = `UPDATE BOOK SET ${setParts.join(', ')} WHERE BookID = $${vals.length}`;
            await db.execute(sql, vals);
        }

        if (authorIdsStr !== undefined) {
            await db.execute('DELETE FROM WRITTEN_BY WHERE BookID = $1', [bookId]);
            if (authorIdsStr.trim() !== '') {
                const authorIds = authorIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                for (const aId of authorIds) {
                    await db.execute('INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES ($1, $2) ON CONFLICT DO NOTHING', [bookId, aId]);
                }
            }
        }
        res.json({ success: true, data: { updated: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
