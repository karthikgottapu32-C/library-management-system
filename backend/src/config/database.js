const { Pool } = require('pg');
require('dotenv').config();

let pool;

async function initialize() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is required for PostgreSQL.');
    }
    const ssl = process.env.PGSSL_CA
        ? { ca: process.env.PGSSL_CA, rejectUnauthorized: true }
        : { rejectUnauthorized: process.env.NODE_ENV === 'production' };
    if (process.env.NODE_ENV === 'production' && !process.env.PGSSL_CA) {
        throw new Error('PGSSL_CA is required for verified Supabase TLS in production.');
    }

    pool = new Pool({
        connectionString,
        ssl,
        max: Number(process.env.PGPOOL_MAX) || 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS) || 10000,
    });

    pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL pool error:', err.message);
    });

    try {
        await pool.query('SELECT 1');
        console.log('PostgreSQL connection verified');
    } catch (err) {
        await pool.end();
        pool = undefined;
        throw new Error(`PostgreSQL connection failed: ${err.message}`);
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
    const rows = result.rows.map((row) => Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key.toUpperCase(), value])
    ));

    return {
        rows,
        metaData: result.fields.map((field) => ({ name: field.name.toUpperCase() })),
        rowsAffected: result.rowCount,
    };
}

module.exports = { initialize, close, execute };