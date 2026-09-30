module.exports = function requireAuth(req, res, next) {
    const authorization = req.get('authorization') || '';
    if (authorization === 'Bearer college-demo-token-123') {
        req.user = { id: 'admin', username: 'admin' };
        return next();
    }
    return res.status(401).json({ success: false, message: 'Authentication required.' });
};
