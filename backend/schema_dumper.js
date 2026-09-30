const oracledb = require('oracledb');
async function run() {
    try {
        let conn = await oracledb.getConnection({
            user: 'c##library_user',
            password: 'library_password',
            connectionString: 'localhost:1521/FREE'
        });
        
        let result = await conn.execute("SELECT table_name FROM user_tables");
        let tables = result.rows.map(r => r[0]);
        let schema = {};
        for(let t of tables) {
            let cols = await conn.execute("SELECT column_name, data_type, nullable, data_default FROM user_tab_columns WHERE table_name = :t", [t]);
            let pks = await conn.execute("SELECT cols.column_name FROM user_constraints cons JOIN user_cons_columns cols ON cons.constraint_name = cols.constraint_name WHERE cons.table_name = :t AND cons.constraint_type = 'P'", [t]);
            let fks = await conn.execute("SELECT cols.column_name, r_cons.table_name as ref_table, r_cols.column_name as ref_col FROM user_constraints cons JOIN user_cons_columns cols ON cons.constraint_name = cols.constraint_name JOIN user_constraints r_cons ON cons.r_constraint_name = r_cons.constraint_name JOIN user_cons_columns r_cols ON r_cons.constraint_name = r_cols.constraint_name WHERE cons.table_name = :t AND cons.constraint_type = 'R'", [t]);
            let chks = await conn.execute("SELECT search_condition FROM user_constraints WHERE table_name = :t AND constraint_type = 'C'", [t]);
            schema[t] = {
                columns: cols.rows,
                pks: pks.rows.map(r=>r[0]),
                fks: fks.rows,
                chks: chks.rows.map(r => r[0])
            };
        }
        require('fs').writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
        console.log('Done');
        await conn.close();
    } catch (e) { console.error(e); }
}
run();
