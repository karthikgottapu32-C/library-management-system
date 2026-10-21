const { Pool } = require('pg');
require('dotenv').config();

let pool;

/**
 * Strips password from database URLs or connection strings for safe logging
 */
function maskConnectionString(str) {
    if (!str) return '';
    try {
        const url = new URL(str);
        if (url.password) url.password = '****';
        return url.toString();
    } catch {
        return str.replace(/:\/\/(.*?):(.*?)@/, '://$1:****@');
    }
}

/**
 * Determine SSL configuration based on host and environment
 */
function resolveSsl(connectionUrl, host) {
    // Explicit override via environment variables
    if (process.env.PGSSLMODE === 'disable' || process.env.PGSSL === 'false' || process.env.DB_SSL === 'false') {
        return false;
    }

    // Check if custom CA is provided
    if (process.env.PGSSL_CA) {
        return {
            ca: process.env.PGSSL_CA,
            rejectUnauthorized: true,
        };
    }

    // Check URL parameters if present
    if (connectionUrl) {
        try {
            const url = new URL(connectionUrl);
            const sslmode = url.searchParams.get('sslmode');
            if (sslmode === 'disable') {
                return false;
            }
            if (sslmode === 'require' || sslmode === 'no-verify') {
                return { rejectUnauthorized: false };
            }
            if (!host) {
                host = url.hostname;
            }
        } catch {
            // Non-standard URL, proceed to host checks
        }
    }

    // If host is local or Render internal private network (dpg-* without domain, or *.internal)
    if (host) {
        const lowerHost = host.toLowerCase();
        const isLocal = lowerHost === 'localhost' || lowerHost === '127.0.0.1';
        const isRenderInternal = lowerHost.endsWith('.internal') || (/^dpg-[a-z0-9]+-[a-z]$/i.test(lowerHost));
        
        if (isLocal || isRenderInternal) {
            // Internal/local connections default to no SSL unless explicitly enabled
            if (process.env.PGSSL === 'true' || process.env.DB_SSL === 'true') {
                return { rejectUnauthorized: false };
            }
            return false;
        }
    }

    // For all remote/external PostgreSQL (e.g. Render external, Supabase, Neon, AWS RDS)
    // or production mode, use SSL with rejectUnauthorized: false
    return { rejectUnauthorized: false };
}

/**
 * Build pg.Pool configuration supporting DATABASE_URL or discrete variables
 */
function createPoolConfig() {
    const rawUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : null;
    const baseConfig = {
        max: Number(process.env.PGPOOL_MAX) || 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS) || 10000,
    };

    if (rawUrl) {
        let hostname = '';
        try {
            const parsed = new URL(rawUrl);
            hostname = parsed.hostname;
        } catch {
            // URL might be postgresql://...
        }
        const ssl = resolveSsl(rawUrl, hostname);
        return {
            ...baseConfig,
            connectionString: rawUrl,
            ssl: ssl || undefined,
        };
    }

    // Fall back to discrete PG* variables if DATABASE_URL is not set
    if (process.env.PGHOST) {
        const host = process.env.PGHOST.trim();
        const ssl = resolveSsl(null, host);
        return {
            ...baseConfig,
            host,
            user: (process.env.PGUSER || 'postgres').trim(),
            password: process.env.PGPASSWORD || '',
            database: (process.env.PGDATABASE || 'postgres').trim(),
            port: Number(process.env.PGPORT) || 5432,
            ssl: ssl || undefined,
        };
    }

    throw new Error(
        'Database configuration missing. Please provide DATABASE_URL (e.g. postgresql://user:password@host:5432/dbname) or PGHOST, PGUSER, PGPASSWORD, PGDATABASE environment variables.'
    );
}

async function initialize() {
    const poolConfig = createPoolConfig();
    const targetDesc = poolConfig.connectionString
        ? maskConnectionString(poolConfig.connectionString)
        : `${poolConfig.host}:${poolConfig.port}/${poolConfig.database} (user: ${poolConfig.user})`;

    console.log(`Initializing database connection to: ${targetDesc}`);

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL pool error:', err.message);
    });

    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connection verified');
    } catch (err) {
        if (pool) {
            await pool.end().catch(() => {});
            pool = undefined;
        }

        // Provide clear diagnostic advice without exposing credentials
        let advice = '';
        if (err.message && err.message.includes('tenant/user') && err.message.includes('not found')) {
            advice = '\n[DIAGNOSTIC] The database rejected the tenant/user. If using Supabase, check if your project is PAUSED in the Supabase dashboard (free projects pause after inactivity) or if the project reference in DATABASE_URL has changed. If using Render PostgreSQL, ensure DATABASE_URL in Render points to your Render PostgreSQL instance.';
        } else if (err.code === 'ENOTFOUND') {
            advice = '\n[DIAGNOSTIC] Database hostname could not be resolved. Please verify the host name in your DATABASE_URL or PGHOST.';
        } else if (err.code === 'ECONNREFUSED') {
            advice = '\n[DIAGNOSTIC] Database connection was refused. Check if the database server is running and the port is open.';
        } else if (err.code === '28P01') {
            advice = '\n[DIAGNOSTIC] Authentication failed. Check your database username and password.';
        }

        throw new Error(`PostgreSQL connection failed: ${err.message}${advice}`);
    }
}

async function close() {
    if (pool) {
        const currentPool = pool;
        pool = undefined;
        await currentPool.end();
        console.log('PostgreSQL pool closed');
    }
}

async function execute(sql, binds = [], opts = {}) {
    if (!pool) {
        throw new Error('PostgreSQL pool is not initialized.');
    }

    let pgSql = sql;
    let pgBinds;
    if (Array.isArray(binds)) {
        pgBinds = binds;
        pgSql = sql.replace(/:(\d+)/g, (_, position) => `$${position}`);
    } else {
        pgBinds = [];
        pgSql = sql.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
            pgBinds.push(binds[name]);
            return `$${pgBinds.length}`;
        });
    }

    const result = await pool.query(pgSql, pgBinds);
    const rows = (result.rows || []).map((row) => Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.toUpperCase(), value])
    ));

    return {
        rows,
        metaData: (result.fields || []).map((field) => ({ name: field.name.toUpperCase() })),
        rowsAffected: result.rowCount || 0,
    };
}

module.exports = { initialize, close, execute };