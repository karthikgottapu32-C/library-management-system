const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.qpnsqwlxzwqtdxsrwjff:Kartheek%401606@aws-0-ap-south-1.pooler.supabase.com:6543/postgres' });
async function fix() {
    await pool.query(`UPDATE PAYMENT SET MemberID = (SELECT MemberID FROM FINE WHERE FINE.FineID = PAYMENT.FineID) WHERE MemberID IS NULL`);
    const p = await pool.query(`SELECT * FROM PAYMENT WHERE MemberID IS NULL`);
    console.log('Orphan Payments remaining:', p.rowCount);
    const f = await pool.query(`SELECT * FROM FINE WHERE MemberID IS NULL OR LoanID IS NULL`);
    console.log('Orphan Fines remaining:', f.rowCount);
    await pool.query(`DELETE FROM PAYMENT WHERE MemberID IS NULL`);
    await pool.query(`DELETE FROM FINE WHERE MemberID IS NULL OR LoanID IS NULL`);
    console.log('Deleted completely orphaned fines and payments to enforce integrity.');
    process.exit(0);
}
fix();
