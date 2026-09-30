const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');
require('dotenv').config();

const PRIMARY_KEYS = {
    AUTHOR: ['AuthorID'],
    BOOK: ['BookID'],
    BOOK_COPY: ['CopyID'],
    BOOK_LOCATION: ['LocationID'],
    CATEGORY: ['CategoryID'],
    FINE: ['FineID'],
    LIBRARIAN: ['LibrarianID'],
    LIBRARY_BRANCH: ['BranchID'],
    LOAN: ['LoanID'],
    MEMBER: ['MemberID'],
    PAYMENT: ['PaymentID'],
    PUBLISHER: ['PublisherID'],
    RESERVATION: ['ReservationID'],
    SUPPLIER: ['SupplierID'],
    WRITTEN_BY: ['BookID', 'AuthorID']
};

function readCsv(table, exportDir, expectedCounts) {
    const rows = parse(fs.readFileSync(path.join(exportDir, `${table}.csv`), 'utf8'), {
        bom: true,
        columns: true,
        skip_empty_lines: true
    });
    if (rows.length !== expectedCounts[table]) {
        throw new Error(`${table} export count mismatch: expected ${expectedCounts[table]}, found ${rows.length}`);
    }
    return rows;
}

function normalizeValue(value, dataType) {
    if (value === null || value === undefined || value === '') return null;
    if (dataType === 'timestamp without time zone' || dataType === 'date') {
        const date = value instanceof Date ? value : new Date(value);
        const useUtc = typeof value === 'string' && /(?:Z|[+-]\d\d:\d\d)$/i.test(value);
        const getPart = (local, utc) => String(useUtc ? date[utc]() : date[local]()).padStart(2, '0');
        const year = useUtc ? date.getUTCFullYear() : date.getFullYear();
        return [
            String(year).padStart(4, '0'),
            getPart('getMonth', 'getUTCMonth') === '00' ? '01' : String(Number(getPart('getMonth', 'getUTCMonth')) + 1).padStart(2, '0'),
            getPart('getDate', 'getUTCDate'),
            dataType === 'date' ? '' : `T${getPart('getHours', 'getUTCHours')}:${getPart('getMinutes', 'getUTCMinutes')}:${getPart('getSeconds', 'getUTCSeconds')}.${String(useUtc ? date.getUTCMilliseconds() : date.getMilliseconds()).padStart(3, '0')}`
        ].join('-');
    }
    if (dataType.includes('timestamp')) {
        const timestamp = new Date(value).getTime();
        return Number.isNaN(timestamp) ? String(value) : timestamp;
    }
    if (['smallint', 'integer', 'bigint', 'numeric', 'decimal', 'real', 'double precision'].includes(dataType)) {
        return Number(value);
    }
    return String(value);
}

async function verify() {
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
    const expectedCounts = JSON.parse(fs.readFileSync(path.join(exportDir, 'export_counts.json'), 'utf8'));
    let failures = 0;

    try {
        const catalog = await pool.query('SELECT schemaname, tablename FROM pg_catalog.pg_tables');
        const publicTables = new Set(catalog.rows
            .filter((row) => row.schemaname === 'public')
            .map((row) => row.tablename.toUpperCase()));
        if (publicTables.size !== 15) {
            failures += 1;
            console.log(`FAIL tables: expected 15 public tables, found ${publicTables.size}`);
        }
        const constraintResult = await pool.query(
            "SELECT contype, COUNT(*)::int AS count FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE n.nspname = 'public' GROUP BY contype"
        );
        const constraints = Object.fromEntries(constraintResult.rows.map((row) => [row.contype, row.count]));
        if (constraints.p !== 15 || constraints.f !== 18) {
            failures += 1;
            console.log(`FAIL constraints: expected 15 primary keys and 18 foreign keys, found ${constraints.p || 0} and ${constraints.f || 0}`);
        } else {
            console.log('OK constraints: 15 primary keys, 18 foreign keys');
        }

        const triggerResult = await pool.query(
            "SELECT COUNT(*)::int AS count FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND NOT t.tgisinternal"
        );
        if (triggerResult.rows[0].count !== 2) {
            failures += 1;
            console.log(`FAIL triggers: expected 2 application triggers, found ${triggerResult.rows[0].count}`);
        } else {
            console.log('OK triggers: 2 application triggers');
        }

        for (const [table, columns] of Object.entries(PRIMARY_KEYS)) {
            if (!publicTables.has(table)) {
                failures += 1;
                console.log(`FAIL ${table}: table is missing from public schema`);
                continue;
            }

            const exportedRows = readCsv(table, exportDir, expectedCounts);
            const makeKey = (row, isDatabaseRow) => columns
                .map((column) => String(row[isDatabaseRow ? column.toLowerCase() : column.toUpperCase()] ?? ''))
                .join(':');
            const exportedKeys = new Set(exportedRows.map((row) => makeKey(row, false)));
            const liveResult = await pool.query(`SELECT * FROM public.${table.toLowerCase()}`);
            const liveByKey = new Map(liveResult.rows.map((row) => [makeKey(row, true), row]));
            const liveKeys = new Set(liveByKey.keys());
            const missingKeys = [...exportedKeys].filter((key) => !liveKeys.has(key));
            const extraRows = [...liveKeys].filter((key) => !exportedKeys.has(key));
            const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM public.${table.toLowerCase()}`);
            const liveCount = countResult.rows[0].count;
            const columnResult = await pool.query(
                'SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
                ['public', table.toLowerCase()]
            );
            const columnTypes = new Map(columnResult.rows.map((row) => [row.column_name, row.data_type]));
            let valueMismatches = 0;
            const mismatchesByColumn = {};

            for (const exportedRow of exportedRows) {
                const key = makeKey(exportedRow, false);
                const liveRow = liveByKey.get(key);
                if (!liveRow) continue;
                for (const [column, exportedValue] of Object.entries(exportedRow)) {
                    const normalizedColumn = column.toLowerCase();
                    const type = columnTypes.get(normalizedColumn);
                    if (!type || normalizeValue(exportedValue, type) !== normalizeValue(liveRow[normalizedColumn], type)) {
                        valueMismatches += 1;
                        mismatchesByColumn[normalizedColumn] = (mismatchesByColumn[normalizedColumn] || 0) + 1;
                    }
                }
            }

            if (missingKeys.length > 0 || valueMismatches > 0 || liveCount < expectedCounts[table]) {
                failures += 1;
                console.log(`FAIL ${table}: export=${expectedCounts[table]}, live=${liveCount}, missing export keys=${missingKeys.length}, value mismatches=${valueMismatches}, differing columns=${JSON.stringify(mismatchesByColumn)}, additional keys=${extraRows.length}`);
            } else {
                console.log(`OK ${table}: export rows and values verified=${expectedCounts[table]}, live=${liveCount}, additional keys=${extraRows.length}`);
            }
        }
    } finally {
        await pool.end();
    }

    if (failures > 0) {
        throw new Error(`${failures} database verification check(s) failed.`);
    }
    console.log('All exported rows and values are present and database structure checks passed.');
}

verify().catch((error) => {
    console.error('Database verification failed:', error.message);
    process.exitCode = 1;
});
