const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'backend', 'src');

// Update genericController.js to use safe query building and support composite keys
const genericContent = `
const db = require('../config/database');

// Safelist for table names
const ALLOWED_TABLES = [
    'AUTHOR', 'BOOK', 'BOOK_COPY', 'BOOK_LOCATION', 'CATEGORY',
    'FINE', 'LIBRARIAN', 'LIBRARY_BRANCH', 'LOAN', 'MEMBER',
    'PAYMENT', 'PUBLISHER', 'RESERVATION', 'SUPPLIER', 'WRITTEN_BY'
];

exports.crud = (tableName, pkColumns) => {
    if (!ALLOWED_TABLES.includes(tableName.toUpperCase())) {
        throw new Error('Invalid table name');
    }
    
    // Normalize pkColumns to array
    const pks = Array.isArray(pkColumns) ? pkColumns : [pkColumns];

    return {
        getAll: async (req, res) => {
            try {
                let sql = \`SELECT * FROM \${tableName}\`;
                let binds = {};
                
                // Very basic safe filtering via exact matches
                const filters = [];
                for (const key of Object.keys(req.query)) {
                    if (key !== 'page' && key !== 'limit' && key !== 'search') {
                        // Assuming frontend sends valid column names. 
                        // In real production, this needs column-level whitelisting.
                        filters.push(\`\${key} = :\${key}\`);
                        binds[key] = req.query[key];
                    }
                }
                
                if (req.query.search) {
                     // specific columns based on table
                     if (tableName === 'BOOK') filters.push(\`(TITLE LIKE '%' || :search || '%' OR ISBN LIKE '%' || :search || '%')\`);
                     if (tableName === 'MEMBER' || tableName === 'AUTHOR') filters.push(\`(FIRSTNAME LIKE '%' || :search || '%' OR LASTNAME LIKE '%' || :search || '%')\`);
                     binds.search = req.query.search;
                }
                
                if (filters.length > 0) {
                    sql += ' WHERE ' + filters.join(' AND ');
                }
                
                // Pagination
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const offset = (page - 1) * limit;
                
                sql += \` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY\`;
                binds.offset = offset;
                binds.limit = limit;

                const result = await db.execute(sql, binds);
                res.json({ success: true, data: result.rows, page, limit });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message.replace(/ORA-\\d+:/, 'Database Error:') });
            }
        },
        getById: async (req, res) => {
            try {
                let sql = \`SELECT * FROM \${tableName} WHERE \`;
                const binds = {};
                
                if (pks.length === 1) {
                    sql += \`\${pks[0]} = :id\`;
                    binds.id = req.params.id;
                } else {
                    // For composite keys like WRITTEN_BY, expect query params
                    const conditions = pks.map(pk => {
                        binds[pk] = req.query[pk] || req.params[pk];
                        return \`\${pk} = :\${pk}\`;
                    });
                    sql += conditions.join(' AND ');
                }
                
                const result = await db.execute(sql, binds);
                if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
                res.json({ success: true, data: result.rows[pks.length === 1 ? 0 : result.rows.length - 1] }); 
            } catch (error) {
                res.status(500).json({ success: false, message: error.message.replace(/ORA-\\d+:/, 'Database Error:') });
            }
        },
        create: async (req, res) => {
            try {
                const keys = Object.keys(req.body);
                const vals = Object.values(req.body);
                const bindNames = keys.map((_, i) => \`:\${i+1}\`);
                
                const sql = \`INSERT INTO \${tableName} (\${keys.join(',')}) VALUES (\${bindNames.join(',')})\`;
                const result = await db.execute(sql, vals, { autoCommit: true });
                res.status(201).json({ success: true, data: { inserted: result.rowsAffected } });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message.replace(/ORA-\\d+:/, 'Validation Error:') });
            }
        },
        update: async (req, res) => {
            try {
                const keys = Object.keys(req.body);
                const vals = Object.values(req.body);
                const setString = keys.map((k, i) => \`\${k} = :\${i+1}\`).join(', ');
                
                let sql = \`UPDATE \${tableName} SET \${setString} WHERE \`;
                if (pks.length === 1) {
                    sql += \`\${pks[0]} = :\${vals.length + 1}\`;
                    vals.push(req.params.id);
                } else {
                     const conditions = pks.map(pk => {
                        vals.push(req.query[pk] || req.params[pk]);
                        return \`\${pk} = :\${vals.length}\`;
                    });
                    sql += conditions.join(' AND ');
                }
                
                const result = await db.execute(sql, vals, { autoCommit: true });
                if (result.rowsAffected === 0) return res.status(404).json({ success: false, message: 'Record not found' });
                res.json({ success: true, data: { updated: result.rowsAffected } });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message.replace(/ORA-\\d+:/, 'Validation Error:') });
            }
        },
        delete: async (req, res) => {
            try {
                let sql = \`DELETE FROM \${tableName} WHERE \`;
                const binds = {};
                if (pks.length === 1) {
                    sql += \`\${pks[0]} = :id\`;
                    binds.id = req.params.id;
                } else {
                    const conditions = pks.map(pk => {
                        binds[pk] = req.query[pk] || req.params[pk];
                        return \`\${pk} = :\${pk}\`;
                    });
                    sql += conditions.join(' AND ');
                }
                const result = await db.execute(sql, binds, { autoCommit: true });
                if (result.rowsAffected === 0) return res.status(404).json({ success: false, message: 'Record not found' });
                res.json({ success: true, data: { deleted: result.rowsAffected } });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message.replace(/ORA-\\d+:/, 'Validation Error:') });
            }
        }
    };
};
`;
fs.writeFileSync(path.join(srcDir, 'controllers', 'genericController.js'), genericContent.trim());


// Update dashboardController.js
const dashboardContent = `
const db = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        const queries = {
            totalBooks: 'SELECT COUNT(*) AS val FROM BOOK',
            totalBookCopies: 'SELECT COUNT(*) AS val FROM BOOK_COPY',
            availableCopies: 'SELECT COUNT(*) AS val FROM BOOK_COPY WHERE Status = \\'Available\\'',
            issuedCopies: 'SELECT COUNT(*) AS val FROM BOOK_COPY WHERE Status = \\'Issued\\'',
            totalMembers: 'SELECT COUNT(*) AS val FROM MEMBER',
            activeLoans: 'SELECT COUNT(*) AS val FROM LOAN WHERE Status = \\'Active\\'',
            overdueLoans: 'SELECT COUNT(*) AS val FROM LOAN WHERE Status = \\'Overdue\\'',
            activeReservations: 'SELECT COUNT(*) AS val FROM RESERVATION WHERE Status = \\'Pending\\'',
            outstandingFines: 'SELECT COUNT(*) AS val FROM FINE WHERE FineStatus = \\'Unpaid\\'',
            totalAuthors: 'SELECT COUNT(*) AS val FROM AUTHOR',
            totalPublishers: 'SELECT COUNT(*) AS val FROM PUBLISHER',
            totalBranches: 'SELECT COUNT(*) AS val FROM LIBRARY_BRANCH'
        };
        const stats = {};
        for (const [key, sql] of Object.entries(queries)) {
            const result = await db.execute(sql);
            stats[key] = result.rows[0].VAL;
        }
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecentLoans = async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM LOAN ORDER BY LoanDate DESC FETCH NEXT 5 ROWS ONLY");
        res.json({ success: true, data: result.rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRecentReservations = async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM RESERVATION ORDER BY ReservationDate DESC FETCH NEXT 5 ROWS ONLY");
        res.json({ success: true, data: result.rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRecentBooks = async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM BOOK ORDER BY BookID DESC FETCH NEXT 5 ROWS ONLY");
        res.json({ success: true, data: result.rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getOverdueLoans = async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM LOAN WHERE Status = 'Overdue'");
        res.json({ success: true, data: result.rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
`;
fs.writeFileSync(path.join(srcDir, 'controllers', 'dashboardController.js'), dashboardContent.trim());

// Update api.js
const routesContent = `
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const generic = require('../controllers/genericController');
const dashboard = require('../controllers/dashboardController');

router.get('/health', async (req, res) => {
    try {
        await db.execute('SELECT 1 FROM DUAL');
        res.json({ status: 'ok', database: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

router.get('/dashboard/stats', dashboard.getStats);
router.get('/dashboard/recent-loans', dashboard.getRecentLoans);
router.get('/dashboard/recent-reservations', dashboard.getRecentReservations);
router.get('/dashboard/recent-books', dashboard.getRecentBooks);
router.get('/dashboard/overdue-loans', dashboard.getOverdueLoans);

const entities = [
    { route: 'authors', table: 'AUTHOR', pk: 'AuthorID' },
    { route: 'books', table: 'BOOK', pk: 'BookID' },
    { route: 'book-copies', table: 'BOOK_COPY', pk: 'CopyID' },
    { route: 'book-locations', table: 'BOOK_LOCATION', pk: 'LocationID' },
    { route: 'categories', table: 'CATEGORY', pk: 'CategoryID' },
    { route: 'fines', table: 'FINE', pk: 'FineID' },
    { route: 'librarians', table: 'LIBRARIAN', pk: 'LibrarianID' },
    { route: 'library-branches', table: 'LIBRARY_BRANCH', pk: 'BranchID' },
    { route: 'loans', table: 'LOAN', pk: 'LoanID' },
    { route: 'members', table: 'MEMBER', pk: 'MemberID' },
    { route: 'payments', table: 'PAYMENT', pk: 'PaymentID' },
    { route: 'publishers', table: 'PUBLISHER', pk: 'PublisherID' },
    { route: 'reservations', table: 'RESERVATION', pk: 'ReservationID' },
    { route: 'suppliers', table: 'SUPPLIER', pk: 'SupplierID' },
    { route: 'written-by', table: 'WRITTEN_BY', pk: ['BookID', 'AuthorID'] } // COMPOSITE KEY
];

entities.forEach(ent => {
    const ctrl = generic.crud(ent.table, ent.pk);
    router.get(\`/\${ent.route}\`, ctrl.getAll);
    
    // special handling for composite keys where we don't have a single /:id
    if (Array.isArray(ent.pk)) {
        router.get(\`/\${ent.route}/detail\`, ctrl.getById);
        router.put(\`/\${ent.route}/detail\`, ctrl.update);
        router.delete(\`/\${ent.route}/detail\`, ctrl.delete);
    } else {
        router.get(\`/\${ent.route}/:id\`, ctrl.getById);
        router.put(\`/\${ent.route}/:id\`, ctrl.update);
        router.delete(\`/\${ent.route}/:id\`, ctrl.delete);
    }
    router.post(\`/\${ent.route}\`, ctrl.create);
});

module.exports = router;
`;
fs.writeFileSync(path.join(srcDir, 'routes', 'api.js'), routesContent.trim());

// Create .gitignore
fs.writeFileSync(path.join(__dirname, 'backend', '.gitignore'), "node_modules\\n.env\\n");
fs.writeFileSync(path.join(__dirname, 'backend', '.env.example'), "ORACLE_USER=\\nORACLE_PASSWORD=\\nORACLE_CONNECT_STRING=\\nPORT=5000\\n");

console.log("Applied backend completion updates.");
