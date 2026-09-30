const express = require('express');
const router = express.Router();
const db = require('../config/database');
const generic = require('../controllers/genericController');
const dashboard = require('../controllers/dashboardController');
const requireAuth = require('../middleware/requireAuth');

async function getHealthResponse(req, res) {
    try {
        const healthQuery = process.env.DATABASE_URL ? 'SELECT 1' : 'SELECT 1';
        await db.execute(healthQuery);
        res.json({ status: 'ok', database: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
}

router.get('/health', getHealthResponse);
router.get('/status', getHealthResponse);

// Simple College Demo Authentication Endpoint
router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUser && password === adminPass) {
        // Return a simple bearer token
        res.json({ success: true, token: 'college-demo-token-123' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

router.use(requireAuth);

router.get('/dashboard/summary', dashboard.getStats);
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
    { route: 'written-by', table: 'WRITTEN_BY', pk: ['BookID', 'AuthorID'] }
];

const advanced = require('../controllers/advancedController');

entities.forEach(ent => {
    const ctrl = generic.crud(ent.table, ent.pk);
    
    if (ent.route === 'books') {
        router.get('/books', advanced.getBooks);
        router.get('/books/:id', ctrl.getById);
        router.put('/books/:id', advanced.updateBook);
        router.delete('/books/:id', ctrl.delete);
        router.post('/books', advanced.createBook);
    } else if (ent.route === 'authors') {
        router.get('/authors', advanced.getAuthors);
        router.get('/authors/:id', ctrl.getById);
        router.put('/authors/:id', ctrl.update);
        router.delete('/authors/:id', ctrl.delete);
        router.post('/authors', ctrl.create);
    } else if (ent.route === 'publishers') {
        router.get('/publishers', advanced.getPublishers);
        router.get('/publishers/:id', ctrl.getById);
        router.put('/publishers/:id', ctrl.update);
        router.delete('/publishers/:id', ctrl.delete);
        router.post('/publishers', ctrl.create);
    } else {
        router.get(`/${ent.route}`, ctrl.getAll);
        if (Array.isArray(ent.pk)) {
            router.get(`/${ent.route}/detail`, ctrl.getById);
            router.put(`/${ent.route}/detail`, ctrl.update);
            router.delete(`/${ent.route}/detail`, ctrl.delete);
        } else {
            router.get(`/${ent.route}/:id`, ctrl.getById);
            router.put(`/${ent.route}/:id`, ctrl.update);
            router.delete(`/${ent.route}/:id`, ctrl.delete);
        }
        router.post(`/${ent.route}`, ctrl.create);
    }
});

module.exports = router;