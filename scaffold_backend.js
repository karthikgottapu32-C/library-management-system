// Using a script to scaffold the Node.js backend
const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });

const packageJson = {
  "name": "library-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "oracledb": "^6.3.0",
    "dotenv": "^16.3.1"
  },
  "scripts": {
    "start": "node server.js"
  }
};

fs.writeFileSync(path.join(backendDir, 'package.json'), JSON.stringify(packageJson, null, 2));

const serverJs = `
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Oracle connection pool
async function initializeDB() {
    try {
        await oracledb.createPool({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectionString: process.env.ORACLE_CONNECT_STRING,
            privilege: oracledb.SYSDBA
        });
        console.log('Connected to Oracle Database as SYSDBA');
    } catch (err) {
        console.error('Error connecting to Oracle:', err);
    }
}

initializeDB();

// Dynamic route generator for simple tables
const entities = ['authors', 'publishers', 'categories', 'books', 'members'];
entities.forEach(entity => {
    app.get(\`/api/\${entity}\`, async (req, res) => {
        let connection;
        try {
            connection = await oracledb.getConnection();
            const result = await connection.execute(\`SELECT * FROM \${entity.toUpperCase().replace(/S$/, '')}\`);
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        } finally {
            if (connection) {
                try { await connection.close(); } catch (err) { console.error(err); }
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`;

fs.writeFileSync(path.join(backendDir, 'server.js'), serverJs);
console.log("Backend scaffolded successfully.");
