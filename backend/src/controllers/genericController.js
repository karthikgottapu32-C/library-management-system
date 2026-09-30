const db = require('../config/database');

// Safelist for table names
const ALLOWED_TABLES = [
    'AUTHOR', 'BOOK', 'BOOK_COPY', 'BOOK_LOCATION', 'CATEGORY',
    'FINE', 'LIBRARIAN', 'LIBRARY_BRANCH', 'LOAN', 'MEMBER',
    'PAYMENT', 'PUBLISHER', 'RESERVATION', 'SUPPLIER', 'WRITTEN_BY'
];

// Columns that support simple text search per table
const SEARCH_COLUMNS = {
    BOOK:           ['TITLE', 'ISBN'],
    MEMBER:         ['MEMBERNAME', 'EMAIL'],
    AUTHOR:         ['AUTHORNAME', 'NATIONALITY'],
    LIBRARIAN:      ['LIBRARIANNAME', 'EMAIL'],
    CATEGORY:       ['CATEGORYNAME'],
    PUBLISHER:      ['PUBLISHERNAME', 'EMAIL'],
    SUPPLIER:       ['SUPPLIERNAME', 'EMAIL'],
    LIBRARY_BRANCH: ['BRANCHNAME', 'ADDRESS'],
    BOOK_LOCATION:  ['LOCATIONNAME'],
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
        return { fragment: `TO_DATE(${bindName},'YYYY-MM-DD')`, val: value.trim() };
    }
    return { fragment: bindName, val: value === '' ? null : value };
}

exports.crud = (tableName, pkColumns) => {
    if (!ALLOWED_TABLES.includes(tableName.toUpperCase())) {
        throw new Error('Invalid table name');
    }

    const pks = Array.isArray(pkColumns) ? pkColumns : [pkColumns];

    return {
        getAll: async (req, res) => {
            try {
                let sql = `SELECT * FROM ${tableName}`;
                let binds = {};
                const filters = [];

                for (const key of Object.keys(req.query)) {
                    if (key !== 'page' && key !== 'limit' && key !== 'search' && !pks.includes(key)) {
                        filters.push(`${key} = :${key}`);
                        binds[key] = req.query[key];
                    }
                }

                if (req.query.search && req.query.search.trim()) {
                    const searchCols = SEARCH_COLUMNS[tableName.toUpperCase()];
                    if (searchCols && searchCols.length > 0) {
                        const conditions = searchCols.map(col => `UPPER(${col}) LIKE '%' || UPPER(:search) || '%'`);
                        filters.push(`(${conditions.join(' OR ')})`);
                        binds.search = req.query.search.trim();
                    }
                }

                if (filters.length > 0) sql += ' WHERE ' + filters.join(' AND ');

                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 100;
                const offset = (page - 1) * limit;

                sql += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
                binds.offset = offset;
                binds.limit = limit;

                const result = await db.execute(sql, binds);
                res.json({ success: true, data: result.rows, page, limit });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message.replace(/ORA-\d+:/, 'Database Error:') });
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
                res.status(500).json({ success: false, message: error.message.replace(/ORA-\d+:/, 'Database Error:') });
            }
        },

        create: async (req, res) => {
            try {
                const body = { ...req.body };

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
                res.status(201).json({ success: true, data: { inserted: result.rowsAffected } });
            } catch (error) {
                let msg = error.message;
                if (msg.includes('ORA-00001')) msg = 'A record with this unique key already exists.';
                else if (msg.includes('ORA-02291')) msg = 'A referenced record (foreign key) does not exist. Check your ID values.';
                else if (msg.includes('ORA-02290')) msg = 'A value violates a check constraint. Check allowed values (e.g., Status must be Active/Returned/Overdue).';
                else if (msg.includes('ORA-01861')) msg = 'Invalid date format. Use YYYY-MM-DD (e.g., 2024-09-15).';
                res.status(400).json({ success: false, message: msg.replace(/ORA-\d+: /, '') });
            }
        },

        update: async (req, res) => {
            try {
                const body = { ...req.body };

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
                if (msg.includes('ORA-00001')) msg = 'A record with this unique key already exists.';
                else if (msg.includes('ORA-02291')) msg = 'A referenced record (foreign key) does not exist. Check your ID values.';
                else if (msg.includes('ORA-02290')) msg = 'A value violates a check constraint. Check allowed values.';
                else if (msg.includes('ORA-01861')) msg = 'Invalid date format. Use YYYY-MM-DD (e.g., 2024-09-15).';
                res.status(400).json({ success: false, message: msg.replace(/ORA-\d+: /, '') });
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
                if (msg.includes('ORA-02292')) {
                    msg = 'Cannot delete — this record is referenced by other records (e.g. loans, copies, or fines). Remove dependent records first.';
                }
                res.status(400).json({ success: false, message: msg.replace(/ORA-\d+: /, '') });
            }
        }
    };
};
