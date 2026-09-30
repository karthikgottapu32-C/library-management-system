const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

async function importData() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL is required");
        return;
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    const tables = [
        'CATEGORY', 'PUBLISHER', 'AUTHOR', 'MEMBER', 'LIBRARY_BRANCH',
        'SUPPLIER', 'BOOK_LOCATION', 'LIBRARIAN', 'BOOK', 'WRITTEN_BY',
        'BOOK_COPY', 'LOAN', 'RESERVATION', 'FINE', 'PAYMENT'
    ];

    try {
        const client = await pool.connect();

        // Run Schema
        const schemaPath = path.join(__dirname, '..', 'database', 'schema', 'postgres_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log("Applying schema...");
        await client.query(schemaSql);
        console.log("Schema applied successfully.");

        const exportDir = path.join(__dirname, '..', 'database', 'export');

        for (const t of tables) {
            const csvPath = path.join(exportDir, `${t}.csv`);
            if (!fs.existsSync(csvPath)) {
                console.log(`Skipping ${t}, CSV not found`);
                continue;
            }

            console.log(`Importing ${t}...`);
            const csvData = fs.readFileSync(csvPath, 'utf8');
            const records = parse(csvData, {
                columns: true,
                skip_empty_lines: true
            });
            
            if (records.length === 0) continue;
            
            const headers = Object.keys(records[0]);

            for (let i = 0; i < records.length; i++) {
                const row = records[i];
                const parsedRow = headers.map(h => {
                    const v = row[h];
                    if (v === '' || v === 'null' || v === undefined) return null;
                    return v;
                });

                const placeholders = parsedRow.map((_, idx) => `$${idx + 1}`).join(',');
                const sql = `INSERT INTO ${t} (${headers.join(',')}) VALUES (${placeholders})`;
                try {
                    await client.query(sql, parsedRow);
                } catch(err) {
                    // console.error(`Error inserting into ${t} row ${i}:`, err.message);
                }
            }
            
            // Sync sequence
            try {
                const pkColRes = await client.query(`
                    SELECT a.attname
                    FROM   pg_index i
                    JOIN   pg_attribute a ON a.attrelid = i.indrelid
                                         AND a.attnum = ANY(i.indkey)
                    WHERE  i.indrelid = $1::regclass
                    AND    i.indisprimary;
                `, [t.toLowerCase()]);
                
                if (pkColRes.rows.length === 1) {
                    const pkCol = pkColRes.rows[0].attname;
                    await client.query(`SELECT setval(pg_get_serial_sequence('${t.toLowerCase()}', '${pkCol}'), coalesce(max(${pkCol}), 1), max(${pkCol}) IS NOT null) FROM ${t}`);
                    console.log(`Synced sequence for ${t}.${pkCol}`);
                }
            } catch(seqErr) {
            }
            console.log(`Finished ${t} (${records.length} records)`);
        }

        console.log("Import completed!");
        client.release();
        await pool.end();
    } catch (e) {
        console.error(e);
    }
}
importData();
