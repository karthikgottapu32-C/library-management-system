const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'backend');
const srcDir = path.join(baseDir, 'src');
const dirs = ['config', 'controllers', 'routes', 'middleware', 'utils'];

dirs.forEach(d => fs.mkdirSync(path.join(srcDir, d), { recursive: true }));

// .env
const envContent = `
ORACLE_USER=c##library_user
ORACLE_PASSWORD=library_password
ORACLE_CONNECT_STRING=localhost:1521/FREE
PORT=5000
`;
fs.writeFileSync(path.join(baseDir, '.env'), envContent.trim());

// src/config/database.js
const dbContent = `
const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function initialize() {
    try {
        await oracledb.createPool({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectionString: process.env.ORACLE_CONNECT_STRING,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('Oracle DB pool started');
    } catch (err) {
        console.error('initialize() error: ' + err.message);
        throw err;
    }
}

async function close() {
    try {
        await oracledb.getPool().close(10);
        console.log('Oracle DB pool closed');
    } catch (err) {
        console.error('close() error: ' + err.message);
    }
}

async function execute(sql, binds = [], opts = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, binds, opts);
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

module.exports = { initialize, close, execute };
`;
fs.writeFileSync(path.join(srcDir, 'config', 'database.js'), dbContent.trim());

// src/controllers/dashboardController.js
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
`;
fs.writeFileSync(path.join(srcDir, 'controllers', 'dashboardController.js'), dashboardContent.trim());

// src/controllers/genericController.js
const genericContent = `
const db = require('../config/database');
const oracledb = require('oracledb');

exports.crud = (tableName, pkColumn) => {
    return {
        getAll: async (req, res) => {
            try {
                let sql = \`SELECT * FROM \${tableName}\`;
                const binds = {};
                if (req.query.search) {
                    // Very simple generic search for demonstration
                    // In a real app, you'd target specific columns
                    sql += \` WHERE ROWNUM <= 50\`; // Limit search randomly for generic controller
                }
                const result = await db.execute(sql, binds);
                res.json({ success: true, data: result.rows });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
        },
        getById: async (req, res) => {
            try {
                const sql = \`SELECT * FROM \${tableName} WHERE \${pkColumn} = :id\`;
                const result = await db.execute(sql, { id: req.params.id });
                if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
                res.json({ success: true, data: result.rows[0] });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
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
                res.status(400).json({ success: false, message: error.message });
            }
        },
        update: async (req, res) => {
            try {
                const keys = Object.keys(req.body);
                const vals = Object.values(req.body);
                const setString = keys.map((k, i) => \`\${k} = :\${i+1}\`).join(', ');
                vals.push(req.params.id);
                
                const sql = \`UPDATE \${tableName} SET \${setString} WHERE \${pkColumn} = :\${vals.length}\`;
                const result = await db.execute(sql, vals, { autoCommit: true });
                res.json({ success: true, data: { updated: result.rowsAffected } });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        },
        delete: async (req, res) => {
            try {
                const sql = \`DELETE FROM \${tableName} WHERE \${pkColumn} = :id\`;
                const result = await db.execute(sql, { id: req.params.id }, { autoCommit: true });
                res.json({ success: true, data: { deleted: result.rowsAffected } });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        }
    };
};
`;
fs.writeFileSync(path.join(srcDir, 'controllers', 'genericController.js'), genericContent.trim());

// src/routes/api.js
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
    { route: 'suppliers', table: 'SUPPLIER', pk: 'SupplierID' }
];

entities.forEach(ent => {
    const ctrl = generic.crud(ent.table, ent.pk);
    router.get(\`/\${ent.route}\`, ctrl.getAll);
    router.get(\`/\${ent.route}/:id\`, ctrl.getById);
    router.post(\`/\${ent.route}\`, ctrl.create);
    router.put(\`/\${ent.route}/:id\`, ctrl.update);
    router.delete(\`/\${ent.route}/:id\`, ctrl.delete);
});

module.exports = router;
`;
fs.writeFileSync(path.join(srcDir, 'routes', 'api.js'), routesContent.trim());

// src/server.js
const serverContent = `
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173']
}));
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

async function startup() {
    console.log('Starting application...');
    try {
        await db.initialize();
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
    app.listen(PORT, () => {
        console.log(\`Server is running on port \${PORT}\`);
    });
}

async function shutdown(e) {
    let err = e;
    console.log('Shutting down...');
    try {
        await db.close();
    } catch (e) {
        console.error(e);
        err = err || e;
    }
    if (err) process.exit(1);
    else process.exit(0);
}

process.once('SIGTERM', shutdown).once('SIGINT', shutdown);

startup();
`;
fs.writeFileSync(path.join(srcDir, 'server.js'), serverContent.trim());

console.log("Backend constructed completely!");
