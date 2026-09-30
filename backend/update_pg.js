const fs = require('fs');

let content = fs.readFileSync('src/controllers/genericController.js', 'utf8');

// Replace Oracle pagination with Postgres pagination
content = content.replace('OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY', 'LIMIT :limit OFFSET :offset');

// Actually, let's just make colBind return bindName always
const regex = /function colBind\(colName, bindName, value\) \{[\s\S]*?return \{ fragment: bindName, val: value === '' \? null : value \};\s*\}/;
content = content.replace(regex, 
`function colBind(colName, bindName, value) {
    if (DATE_COLUMNS.has(colName.toUpperCase()) && isDateString(value)) {
        return { fragment: bindName, val: value.trim() };
    }
    return { fragment: bindName, val: value === '' ? null : value };
}`);

// Fix ORA- codes to standard Postgres codes
content = content.replace(/msg\.includes\('ORA-00001'\)/g, 'msg.includes(\'23505\')');
content = content.replace(/msg\.includes\('ORA-02291'\)/g, 'msg.includes(\'23503\')');
content = content.replace(/msg\.includes\('ORA-02290'\)/g, 'msg.includes(\'23514\')');
content = content.replace(/msg\.includes\('ORA-01861'\)/g, 'msg.includes(\'22007\')');
content = content.replace(/msg\.includes\('ORA-02292'\)/g, 'msg.includes(\'23503\')');

content = content.replace(/error\.message\.replace\(\/ORA-\\d\+:\/, 'Database Error:'\)/g, 'error.message');
content = content.replace(/msg\.replace\(\/ORA-\\d\+: \/, ''\)/g, 'msg');

// Convert search logic to ILIKE
content = content.replace(/UPPER\(\$\{col\}\) LIKE '%' \|\| UPPER\(:search\) \|\| '%'/g, '${col} ILIKE \'%\' || :search || \'%\'');

// Also fix RETURNING logic for inserts so we can return rows affected properly?
// We won't need to, our execute wrapper in database.js returns rowsAffected.

fs.writeFileSync('src/controllers/genericController.js', content);
console.log('genericController updated for Postgres.');
