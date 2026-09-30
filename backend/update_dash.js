const fs = require('fs');
let content = fs.readFileSync('src/controllers/dashboardController.js', 'utf8');

// Replace Oracle limit with Postgres limit
content = content.replace(/FETCH NEXT (\d+) ROWS ONLY/g, 'LIMIT $1');

fs.writeFileSync('src/controllers/dashboardController.js', content);
console.log('dashboardController updated for Postgres.');
