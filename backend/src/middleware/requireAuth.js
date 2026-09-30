module.exports = function requireAuth(req, res, next) {
    // Authentication has been disabled for simplicity
    req.user = { id: 'admin', email: 'admin@library.com' };
    return next();
};
