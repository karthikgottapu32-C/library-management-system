const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function initialize() {
    try {
        await oracledb.createPool({
            user: 'c##library_user',
            password: 'library_password',
            connectionString: 'localhost:1521/FREE',
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('Oracle DB pool started');
    } catch (err) {
        console.error('initialize() error: ' + err.message);
        throw err;
    }
}

async function close() {
    try {
        await oracledb.getPool().close(10);
        console.log('Oracle DB pool closed');
    } catch (err) {
        console.error('close() error: ' + err.message);
    }
}

async function execute(sql, binds = [], opts = {}) {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const result = await connection.execute(sql, binds, opts);
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

module.exports = { initialize, close, execute };
