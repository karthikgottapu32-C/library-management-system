const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/database');
const apiRoutes = require('./routes/api');

const path = require('path');

const app = express();
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://khwp7hf3-5173.inc1.devtunnels.ms',
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:8000'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api', apiRoutes);

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
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on 0.0.0.0:${PORT}`);
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