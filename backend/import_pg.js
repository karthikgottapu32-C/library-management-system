const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

const TABLES = [
    'CATEGORY', 'PUBLISHER', 'AUTHOR', 'MEMBER', 'LIBRARY_BRANCH',
    'SUPPLIER', 'BOOK_LOCATION', 'LIBRARIAN', 'BOOK', 'WRITTEN_BY',
    'BOOK_COPY', 'LOAN', 'RESERVATION', 'FINE', 'PAYMENT'
];
const PRIMARY_KEYS = {
    CATEGORY: 'CategoryID',
    PUBLISHER: 'PublisherID',
    AUTHOR: 'AuthorID',
    MEMBER: 'MemberID',
    LIBRARY_BRANCH: 'BranchID',
    SUPPLIER: 'SupplierID',
    BOOK_LOCATION: 'LocationID',
    LIBRARIAN: 'LibrarianID',
    BOOK: 'BookID',
    BOOK_COPY: 'CopyID',
    LOAN: 'LoanID',
    RESERVATION: 'ReservationID',
    FINE: 'FineID',
    PAYMENT: 'PaymentID'
};

function readExport(table, exportDir, expectedCounts) {
    const csvPath = path.join(exportDir, `${table}.csv`);
    if (!fs.existsSync(csvPath)) {
        throw new Error(`Required CSV is missing: ${csvPath}`);
    }

    const records = parse(fs.readFileSync(csvPath, 'utf8'), {
        bom: true,
        columns: true,
        skip_empty_lines: true
    });
    const expected = expectedCounts[table];
    if (!Number.isInteger(expected) || records.length !== expected) {
        throw new Error(`${table} export count mismatch: expected ${expected}, found ${records.length}`);
    }
    if (records.length === 0) {
        throw new Error(`${table} export is empty; refusing to migrate incomplete data.`);
    }

    const columns = Object.keys(records[0]);
    if (columns.some((column) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(column))) {
        throw new Error(`${table} export contains an invalid column name.`);
    }
    if (records.some((record) => Object.keys(record).length !== columns.length)) {
        throw new Error(`${table} export contains inconsistent columns.`);
    }

    return { columns, records };
}

async function importData() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required.');
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSL_CA
            ? { ca: process.env.PGSSL_CA, rejectUnauthorized: true }
            : { rejectUnauthorized: process.env.NODE_ENV === 'production' },
        max: 1,
        connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS) || 10000
    });
    const exportDir = path.join(__dirname, '..', 'database', 'export');
    const countsPath = path.join(exportDir, 'export_counts.json');
    const expectedCounts = JSON.parse(fs.readFileSync(countsPath, 'utf8'));
    const exports = new Map(TABLES.map((table) => [
        table,
        readExport(table, exportDir, expectedCounts)
    ]));
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const existing = await client.query(
            'SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = $2',
            ['public', 'BASE TABLE']
        );
        const existingNames = new Set(existing.rows.map((row) => row.table_name.toUpperCase()));
        const conflicts = TABLES.filter((table) => existingNames.has(table));
        if (conflicts.length > 0) {
            throw new Error(`Refusing to overwrite existing tables: ${conflicts.join(', ')}. Use an empty Supabase project for the initial import.`);
        }

        const schemaPath = path.join(__dirname, '..', 'database', 'schema', 'postgres_schema.sql');
        await client.query(fs.readFileSync(schemaPath, 'utf8'));
        await client.query('ALTER TABLE LOAN DISABLE TRIGGER trg_update_copy_status');
        await client.query('ALTER TABLE PAYMENT DISABLE TRIGGER trg_update_fine_status');

        for (const table of TABLES) {
            const { columns, records } = exports.get(table);
            const insertSql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')})`;

            for (const record of records) {
                const values = columns.map((column) => {
                    const value = record[column];
                    return value === '' || value === undefined || /^null$/i.test(value) ? null : value;
                });
                await client.query(insertSql, values);
            }

            const primaryKey = PRIMARY_KEYS[table];
            if (primaryKey) {
                await client.query(
                    `SELECT setval(pg_get_serial_sequence($1, $2), COALESCE(MAX(${primaryKey}), 1), COUNT(*) > 0) FROM ${table}`,
                    [table.toLowerCase(), primaryKey.toLowerCase()]
                );
            }

            const result = await client.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
            const actualCount = result.rows[0].count;
            if (actualCount !== expectedCounts[table]) {
                throw new Error(`${table} verification failed: expected ${expectedCounts[table]}, found ${actualCount}`);
            }
            console.log(`${table}: verified ${actualCount} rows`);
        }

        await client.query('ALTER TABLE LOAN ENABLE TRIGGER trg_update_copy_status');
        await client.query('ALTER TABLE PAYMENT ENABLE TRIGGER trg_update_fine_status');
        await client.query('COMMIT');
        console.log('PostgreSQL migration committed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

importData().catch((error) => {
    console.error('PostgreSQL import failed:', error.message);
    process.exitCode = 1;
});
