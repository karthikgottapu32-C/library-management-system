const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.qpnsqwlxzwqtdxsrwjff:Kartheek%401606@aws-0-ap-south-1.pooler.supabase.com:6543/postgres' });
async function scan() {
    const checks = [
        { table: 'BOOK', fks: ['CategoryID', 'PublisherID'] },
        { table: 'BOOK_COPY', fks: ['BookID', 'BranchID', 'LocationID'] },
        { table: 'LOAN', fks: ['MemberID', 'CopyID'] },
        { table: 'RESERVATION', fks: ['MemberID', 'BookID'] },
        { table: 'WRITTEN_BY', fks: ['BookID', 'AuthorID'] },
        { table: 'FINE', fks: ['LoanID', 'MemberID'] },
        { table: 'PAYMENT', fks: ['FineID', 'MemberID'] }
    ];
    let errors = 0;
    for (const c of checks) {
        for (const fk of c.fks) {
            const res = await pool.query(`SELECT COUNT(*) as cnt FROM ${c.table} WHERE ${fk} IS NULL`);
            const count = parseInt(res.rows[0].cnt, 10);
            if (count > 0) {
                console.log(`WARNING: ${c.table} has ${count} records with NULL ${fk}`);
                errors++;
            }
        }
    }
    if (errors === 0) console.log('All Foreign Keys are NOT NULL. Integrity holds.');
    process.exit(0);
}
scan();
