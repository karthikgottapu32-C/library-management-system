const db = require('../config/database');

// Safelist for table names
const ALLOWED_TABLES = [
    'AUTHOR', 'BOOK', 'BOOK_COPY', 'BOOK_LOCATION', 'CATEGORY',
    'FINE', 'LIBRARIAN', 'LIBRARY_BRANCH', 'LOAN', 'MEMBER',
    'PAYMENT', 'PUBLISHER', 'RESERVATION', 'SUPPLIER', 'WRITTEN_BY'
];
const TABLE_COLUMNS = {
    AUTHOR: ['AUTHORID', 'AUTHORNAME', 'NATIONALITY', 'BIOGRAPHY'],
    BOOK: ['BOOKID', 'ISBN', 'TITLE', 'CATEGORYID', 'PUBLISHERID', 'PRICE', 'EDITION', 'PUBLISHYEAR'],
    BOOK_COPY: ['COPYID', 'BOOKID', 'BRANCHID', 'LOCATIONID', 'ACCESSIONNO', 'STATUS', 'SHELFLOCATION', 'DATEACQUIRED'],
    BOOK_LOCATION: ['LOCATIONID', 'LOCATIONNAME', 'DESCRIPTION', 'BRANCHID'],
    CATEGORY: ['CATEGORYID', 'CATEGORYNAME', 'DESCRIPTION'],
    FINE: ['FINEID', 'LOANID', 'MEMBERID', 'FINEAMOUNT', 'FINEDATE', 'FINESTATUS'],
    LIBRARIAN: ['LIBRARIANID', 'LIBRARIANNAME', 'PHONE', 'EMAIL', 'BRANCHID'],
    LIBRARY_BRANCH: ['BRANCHID', 'BRANCHNAME', 'ADDRESS', 'PHONE'],
    LOAN: ['LOANID', 'MEMBERID', 'COPYID', 'LIBRARIANID', 'ISSUEDATE', 'DUEDATE', 'RETURNDATE', 'STATUS'],
    MEMBER: ['MEMBERID', 'MEMBERNAME', 'ADDRESS', 'PHONE', 'EMAIL', 'MEMBERTYPE', 'DATEJOINED'],
    PAYMENT: ['PAYMENTID', 'FINEID', 'MEMBERID', 'AMOUNT', 'PAYMENTDATE', 'PAYMENTMODE'],
    PUBLISHER: ['PUBLISHERID', 'PUBLISHERNAME', 'ADDRESS', 'PHONE', 'EMAIL'],
    RESERVATION: ['RESERVATIONID', 'MEMBERID', 'BOOKID', 'RESERVATIONDATE', 'STATUS'],
    SUPPLIER: ['SUPPLIERID', 'SUPPLIERNAME', 'PHONE', 'EMAIL'],
    WRITTEN_BY: ['BOOKID', 'AUTHORID']
};

// Columns that support simple text search per table
const SEARCH_COLUMNS = {
    BOOK:           ['TITLE', 'ISBN'],
    BOOK_COPY:      ['ACCESSIONNO', 'STATUS', 'SHELFLOCATION'],
    MEMBER:         ['MEMBERNAME', 'EMAIL', 'PHONE', 'ADDRESS'],
    AUTHOR:         ['AUTHORNAME', 'NATIONALITY'],
    LIBRARIAN:      ['LIBRARIANNAME', 'EMAIL', 'PHONE'],
    CATEGORY:       ['CATEGORYNAME', 'DESCRIPTION'],
    PUBLISHER:      ['PUBLISHERNAME', 'EMAIL', 'PHONE'],
    SUPPLIER:       ['SUPPLIERNAME', 'EMAIL', 'PHONE'],
    LIBRARY_BRANCH: ['BRANCHNAME', 'ADDRESS', 'PHONE'],
    BOOK_LOCATION:  ['LOCATIONNAME', 'DESCRIPTION'],
    LOAN:           ['STATUS'],
    FINE:           ['FINESTATUS'],
    RESERVATION:    ['STATUS'],
    PAYMENT:        ['PAYMENTMODE'],
};

// Columns that hold DATE values and need TO_DATE wrapping when a string is passed
const DATE_COLUMNS = new Set([
    'ISSUEDATE', 'DUEDATE', 'RETURNDATE', 'FINEDATE',
    'RESERVATIONDATE', 'PAYMENTDATE', 'DATEJOINED', 'DATEACQUIRED', 'HIREDATE'
]);

/**
 * Determine if a value looks like a YYYY-MM-DD date string.
 */
function isDateString(val) {
    return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val.trim());
}

/**
 * Build the SQL fragment and bind value for a column.
 * If the column is a date column and the value looks like YYYY-MM-DD, 
 * emit  TO_DATE(:n,'YYYY-MM-DD') and pass the string as-is.
 * Otherwise emit  :n.
 */
function colBind(colName, bindName, value) {
    if (DATE_COLUMNS.has(colName.toUpperCase()) && isDateString(value)) {
        return { fragment: bindName, val: value.trim() };
    }
    return { fragment: bindName, val: value === '' ? null : value };
}

function normalizeBody(body, allowedColumns) {
    const normalized = {};
    for (const [key, value] of Object.entries(body)) {
        const column = key.toUpperCase();
        if (!allowedColumns.includes(column)) {
            throw new Error(`Unknown column: ${key}`);
        }
        normalized[column] = value;
    }
    return normalized;
}

exports.crud = (tableName, pkColumns) => {
    if (!ALLOWED_TABLES.includes(tableName.toUpperCase())) {
        throw new Error('Invalid table name');
    }

    const pks = (Array.isArray(pkColumns) ? pkColumns : [pkColumns]).map((pk) => pk.toUpperCase());
    const allowedColumns = TABLE_COLUMNS[tableName.toUpperCase()];

    return {
        getAll: async (req, res) => {
            try {
                let sql = `SELECT * FROM ${tableName}`;
                let binds = {};
                const filters = [];

                for (const key of Object.keys(req.query)) {
                    const column = key.toUpperCase();
                    if (key !== 'page' && key !== 'limit' && key !== 'search' && !pks.includes(column)) {
                        if (!allowedColumns.includes(column)) {
                            return res.status(400).json({ success: false, message: `Unknown filter: ${key}` });
                        }
                        filters.push(`${column} = :${column}`);
                        binds[column] = req.query[key];
                    }
                }

                if (req.query.search && req.query.search.trim()) {
                    const searchCols = SEARCH_COLUMNS[tableName.toUpperCase()];
                    if (searchCols && searchCols.length > 0) {
                        const conditions = searchCols.map(col => `${col} ILIKE '%' || :search || '%'`);
                        filters.push(`(${conditions.join(' OR ')})`);
                        binds.search = req.query.search.trim();
                    }
                }

                if (filters.length > 0) sql += ' WHERE ' + filters.join(' AND ');

                const page = Math.max(1, parseInt(req.query.page, 10) || 1);
                const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
                const offset = (page - 1) * limit;

                sql += ` LIMIT :limit OFFSET :offset`;
                binds.offset = offset;
                binds.limit = limit;

                const result = await db.execute(sql, binds);
                res.json({ success: true, data: result.rows, page, limit });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        getById: async (req, res) => {
            try {
                let sql = `SELECT * FROM ${tableName} WHERE `;
                const binds = {};

                if (pks.length === 1) {
                    sql += `${pks[0]} = :id`;
                    binds.id = req.params.id;
                } else {
                    const conditions = pks.map(pk => {
                        binds[pk] = req.query[pk] || req.params[pk];
                        return `${pk} = :${pk}`;
                    });
                    sql += conditions.join(' AND ');
                }

                const result = await db.execute(sql, binds);
                if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
                res.json({ success: true, data: result.rows[0] });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },

        create: async (req, res) => {
            try {
                const body = normalizeBody(req.body, allowedColumns);

                // Always remove single auto-generated PKs before INSERT — Oracle trigger assigns it
                if (pks.length === 1) {
                    delete body[pks[0]];
                }

                // Remove any keys with undefined values
                for (const k of Object.keys(body)) {
                    if (body[k] === undefined) delete body[k];
                }

                const keys = Object.keys(body);
                if (keys.length === 0) {
                    return res.status(400).json({ success: false, message: 'No fields provided for insert.' });
                }

                // Build fragments and bind values, handling date columns properly
                const vals = [];
                const fragments = keys.map((k, i) => {
                    const { fragment, val } = colBind(k, `:${i + 1}`, body[k]);
                    vals.push(val);
                    return fragment;
                });

                const sql = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${fragments.join(',')})`;
                const result = await db.execute(sql, vals, { autoCommit: true });
                res.status(201).json({ success: true, data: { inserted: result.rowsAffected, record: result.rows[0] } });
            } catch (error) {
                let msg = error.message;
                if (msg.includes('23505')) msg = 'A record with this unique key already exists.';
                else if (msg.includes('23503')) msg = 'A referenced record (foreign key) does not exist. Check your ID values.';
                else if (msg.includes('23514')) msg = 'A value violates a check constraint. Check allowed values (e.g., Status must be Active/Returned/Overdue).';
                else if (msg.includes('22007')) msg = 'Invalid date format. Use YYYY-MM-DD (e.g., 2024-09-15).';
                res.status(400).json({ success: false, message: msg });
            }
        },

        update: async (req, res) => {
            try {
                const body = normalizeBody(req.body, allowedColumns);

                // Strip PKs so they don't appear in SET clause
                for (const pk of pks) {
                    delete body[pk];
                }

                const keys = Object.keys(body);
                if (keys.length === 0) return res.json({ success: true, message: 'No fields to update' });

                const vals = [];
                const setParts = keys.map((k, i) => {
                    const { fragment, val } = colBind(k, `:${i + 1}`, body[k]);
                    vals.push(val);
                    return `${k} = ${fragment}`;
                });
                const setString = setParts.join(', ');

                let sql = `UPDATE ${tableName} SET ${setString} WHERE `;
                if (pks.length === 1) {
                    sql += `${pks[0]} = :${vals.length + 1}`;
                    vals.push(req.params.id);
                } else {
                    const conditions = pks.map(pk => {
                        vals.push(req.query[pk] || req.params[pk]);
                        return `${pk} = :${vals.length}`;
                    });
                    sql += conditions.join(' AND ');
                }

                const result = await db.execute(sql, vals, { autoCommit: true });
                if (result.rowsAffected === 0) return res.status(404).json({ success: false, message: 'Record not found' });
                res.json({ success: true, data: { updated: result.rowsAffected } });
            } catch (error) {
                let msg = error.message;
                if (msg.includes('23505')) msg = 'A record with this unique key already exists.';
                else if (msg.includes('23503')) msg = 'A referenced record (foreign key) does not exist. Check your ID values.';
                else if (msg.includes('23514')) msg = 'A value violates a check constraint. Check allowed values.';
                else if (msg.includes('22007')) msg = 'Invalid date format. Use YYYY-MM-DD (e.g., 2024-09-15).';
                res.status(400).json({ success: false, message: msg });
            }
        },

        delete: async (req, res) => {
            try {
                let sql = `DELETE FROM ${tableName} WHERE `;
                const binds = {};

                if (pks.length === 1) {
                    sql += `${pks[0]} = :id`;
                    binds.id = req.params.id;
                } else {
                    const conditions = pks.map(pk => {
                        binds[pk] = req.query[pk] || req.params[pk];
                        return `${pk} = :${pk}`;
                    });
                    sql += conditions.join(' AND ');
                }

                const result = await db.execute(sql, binds, { autoCommit: true });
                if (result.rowsAffected === 0) return res.status(404).json({ success: false, message: 'Record not found' });
                res.json({ success: true, data: { deleted: result.rowsAffected } });
            } catch (error) {
                let msg = error.message;
                if (msg.includes('23503')) {
                    msg = 'Cannot delete — this record is referenced by other records (e.g. loans, copies, or fines). Remove dependent records first.';
                }
                res.status(400).json({ success: false, message: msg });
            }
        }
    };
};
