const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

async function exportData() {
    let connection;
    try {
        oracledb.autoCommit = true;
        connection = await oracledb.getConnection({
            user: 'c##library_user',
            password: 'library_password',
            connectString: 'localhost:1521/FREE'
        });

        const tables = [
            'AUTHOR', 'PUBLISHER', 'CATEGORY', 'MEMBER', 'LIBRARY_BRANCH',
            'LIBRARIAN', 'SUPPLIER', 'BOOK_LOCATION', 'BOOK', 'WRITTEN_BY',
            'BOOK_COPY', 'LOAN', 'FINE', 'PAYMENT', 'RESERVATION'
        ];

        const outDir = path.join(__dirname, '..', 'database', 'export');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const counts = {};
        for (const t of tables) {
            try {
                let result = await connection.execute(`SELECT COUNT(*) as CNT FROM ${t}`);
                counts[t] = result.rows[0][0];
                
                let dataResult = await connection.execute(`SELECT * FROM ${t}`);
                const cols = dataResult.metaData.map(m => m.name).join(',');
                let csv = cols + '\n';
                for (const row of dataResult.rows) {
                    csv += row.map(val => val === null ? '' : JSON.stringify(val)).join(',') + '\n';
                }
                fs.writeFileSync(path.join(outDir, `${t}.csv`), csv);
                console.log(`Exported ${t}: ${counts[t]} rows`);
            } catch (e) {
                console.log(`Failed on ${t}: ${e.message}`);
            }
        }
        
        fs.writeFileSync(path.join(outDir, 'export_counts.json'), JSON.stringify(counts, null, 2));
        console.log('Export counts saved.');

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
}
exportData();
