const express = require('express');
const router = express.Router();
const db = require('../config/database');
const generic = require('../controllers/genericController');
const dashboard = require('../controllers/dashboardController');

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
    router.get(`/${ent.route}`, ctrl.getAll);
    
    // special handling for composite keys where we don't have a single /:id
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
});

module.exports = router;