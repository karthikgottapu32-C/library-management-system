const db = require('../config/database');

exports.getBooks = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
        const offset = (page - 1) * limit;

        const sql = `
            SELECT 
                B.*, 
                STRING_AGG(A.AuthorName, ', ') AS AUTHOR_NAMES
            FROM BOOK B
            LEFT JOIN WRITTEN_BY WB ON B.BookID = WB.BookID
            LEFT JOIN AUTHOR A ON WB.AuthorID = A.AuthorID
            GROUP BY B.BookID
            ORDER BY B.BookID DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.execute(sql, [limit, offset]);
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

        const sql = `
            SELECT 
                A.*, 
                STRING_AGG(B.Title, ', ') AS BOOK_TITLES
            FROM AUTHOR A
            LEFT JOIN WRITTEN_BY WB ON A.AuthorID = WB.AuthorID
            LEFT JOIN BOOK B ON WB.BookID = B.BookID
            GROUP BY A.AuthorID
            ORDER BY A.AuthorID DESC
            LIMIT $1 OFFSET $2
        `;
        const result = await db.execute(sql, [limit, offset]);
        res.json({ success: true, data: result.rows, page, limit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createBook = async (req, res, next) => {
    // Extract AUTHOR_IDS from the body if present
    const authorIdsStr = req.body.AUTHOR_IDS;
    delete req.body.AUTHOR_IDS; // Remove it so genericController doesn't fail on unknown column

    // We need to insert the book first.
    // Instead of completely rewriting create(), we can intercept it, but wait!
    // genericController sends the response, we can't easily hook AFTER it responds.
    // Let's just do it manually here.
    try {
        const title = req.body.TITLE;
        const isbn = req.body.ISBN || null;
        const catId = req.body.CATEGORYID || null;
        const pubId = req.body.PUBLISHERID || null;
        const price = req.body.PRICE || null;
        const edition = req.body.EDITION || null;
        const year = req.body.PUBLISHYEAR || null;

        if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

        const insertSql = `
            INSERT INTO BOOK (ISBN, Title, CategoryID, PublisherID, Price, Edition, PublishYear)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const result = await db.execute(insertSql, [isbn, title, catId, pubId, price, edition, year]);
        const newBookId = result.rows[0].BOOKID;

        if (authorIdsStr) {
            const authorIds = authorIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            for (const aId of authorIds) {
                await db.execute('INSERT INTO WRITTEN_BY (BookID, AuthorID) VALUES ($1, $2) ON CONFLICT DO NOTHING', [newBookId, aId]);
            }
        }

        res.status(201).json({ success: true, data: { inserted: 1, record: result.rows[0] } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateBook = async (req, res, next) => {
    const authorIdsStr = req.body.AUTHOR_IDS;
    delete req.body.AUTHOR_IDS; 
    const bookId = req.params.id;

    try {
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
            // Re-sync authors
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
