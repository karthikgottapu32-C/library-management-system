const { createRemoteJWKSet, jwtVerify } = require('jose');

let jwks;
let jwksUrl;

function getJwks(supabaseUrl) {
    const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
    if (url !== jwksUrl) {
        jwksUrl = url;
        jwks = createRemoteJWKSet(new URL(url));
    }
    return jwks;
}

module.exports = async function requireAuth(req, res, next) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const allowedEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
    if (!supabaseUrl || allowedEmails.length === 0) {
        return res.status(503).json({ success: false, message: 'Authentication is not configured.' });
    }

    const authorization = req.get('authorization') || '';
    const token = authorization.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length)
        : '';
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    try {
        const issuer = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
        const { payload } = await jwtVerify(token, getJwks(supabaseUrl), {
            issuer,
            audience: 'authenticated'
        });
        if (!payload.email || !allowedEmails.includes(payload.email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'Administrator access required.' });
        }
        req.user = { id: payload.sub, email: payload.email };
        return next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired access token.' });
    }
};
