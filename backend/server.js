const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Middleware
// ======================
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: [
    'X-Original-Filename',
    'X-Mime-Type',
    'X-File-Id',
    'Content-Type',
    'Content-Disposition'
  ]
}));

// Ensure preflight OPTIONS requests are handled for all endpoints
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Static Files (Frontend)
// ======================
const frontendBuildDir = path.join(__dirname, '..', 'frontend', 'build');
const publicDir = path.join(__dirname, 'public');

// Use frontend build if exists, otherwise fallback to public
const staticDir = fs.existsSync(frontendBuildDir) ? frontendBuildDir : publicDir;
app.use(express.static(staticDir));

// ======================
// Ensure uploads folder exists
// ======================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ======================
// Basic Routes (IMPORTANT for Railway)
// ======================
app.get('/', (req, res) => {
  res.send('🚀 BlockSecure Backend is running');
});

app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// ======================
// API Routes
// ======================
app.use('/api', fileRoutes);
app.use('/api', blockchainRoutes);

// ======================
// SPA Fallback (only if index.html exists)
// ======================
const indexPath = path.join(staticDir, 'index.html');
if (fs.existsSync(indexPath)) {
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
}

// ======================
// Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// ======================
// 404 Handler
// ======================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});