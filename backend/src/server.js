const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');
const apiRoutes = require('./routes/api');

const path = require('path');

const app = express();
app.disable('x-powered-by');
const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
}
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRoutes);
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'API route not found' });
});

// Serve production React build
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 8000;

async function startup() {
    console.log('Starting application...');
    try {
        await db.initialize();
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
    const server = app.listen(PORT, '0.0.0.0');
    server.once('listening', () => {
        console.log(`Server is running on 0.0.0.0:${PORT}`);
    });
    server.once('error', (err) => {
        console.error(`Failed to listen on port ${PORT}:`, err.message);
        shutdown(err);
    });
}

async function shutdown(e) {
    let err = e;
    console.log('Shutting down...');
    try {
        await db.close();
    } catch (e) {
        console.error(e);
        err = err || e;
    }
    if (err) process.exit(1);
    else process.exit(0);
}

process.once('SIGTERM', shutdown).once('SIGINT', shutdown);

startup();