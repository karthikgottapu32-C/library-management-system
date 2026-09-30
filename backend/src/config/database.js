const { Pool } = require('pg');
require('dotenv').config();

let pool;

async function initialize() {
    try {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error('Set DATABASE_URL environment variable for PostgreSQL.');
        }

        // Add pgbouncer=true for Supabase pooler compatibility
        const finalConnectionString = connectionString.includes('pgbouncer=true') 
            ? connectionString 
            : connectionString + (connectionString.includes('?') ? '&' : '?') + 'pgbouncer=true';

        pool = new Pool({
            connectionString: finalConnectionString,
            ssl: {
                rejectUnauthorized: false
            },
            max: 10, // Limit connections for free tier
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err.message);
        });

        // Test connection
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            console.log('PostgreSQL DB pool started');
        } catch (e) {
            console.warn('Initial DB ping failed (this can happen with poolers), continuing anyway...', e.message);
        }

    } catch (err) {
        console.error('initialize() error:', err.message);
        throw err;
    }
}

async function close() {
    try {
        if (pool) {
            await pool.end();
            console.log('PostgreSQL DB pool closed');
        }
    } catch (err) {
        console.error('close() error:', err.message);
    }
}

/**
 * Compatibility wrapper to match oracledb signature.
 */
async function execute(sql, binds = [], opts = {}) {
    let client;
    try {
        client = await pool.connect();
        
        let pgSql = sql;
        let pgBinds = [];

        if (!Array.isArray(binds)) {
            let i = 1;
            pgSql = sql.replace(/:([a-zA-Z0-9_]+)/g, (match, p1) => {
                pgBinds.push(binds[p1]);
                return '$' + (i++);
            });
        } else {
            pgBinds = binds;
            pgSql = sql.replace(/:(\d+)/g, '$$$1');
        }

        const result = await client.query(pgSql, pgBinds);
        
        const rows = result.rows.map(row => {
            const newRow = {};
            for (let key in row) {
                newRow[key.toUpperCase()] = row[key];
            }
            return newRow;
        });

        return {
            rows: rows,
            metaData: result.fields.map(f => ({ name: f.name.toUpperCase() })),
            rowsAffected: result.rowCount
        };
    } catch (err) {
        console.error('Execute error:', err.message);
        throw err;
    } finally {
        if (client) {
            client.release();
        }
    }
}

module.exports = { initialize, close, execute };