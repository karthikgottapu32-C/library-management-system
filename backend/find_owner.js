const oracledb = require('oracledb');
const fs = require('fs');

async function test() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: 'c##library_user',
            password: 'library_password',
            connectString: 'localhost:1521/FREE'
        });

        // find which schema owns BOOK
        let res = await connection.execute(`SELECT COUNT(*) FROM BOOK`);
        console.log("SUCCESS!", res.rows);

    } catch (err) {
        console.error("FAIL:", err.message);
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { }
        }
    }
}
test();
