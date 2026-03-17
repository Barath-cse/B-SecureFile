const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Original-Filename', 'X-Mime-Type', 'X-File-Id', 'Content-Type', 'Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend) from build output (if present) or the legacy public directory
const frontendBuildDir = path.join(__dirname, '..', 'frontend', 'build');
const publicDir = path.join(__dirname, 'public');
const staticDir = fs.existsSync(frontendBuildDir) ? frontendBuildDir : publicDir;
app.use(express.static(staticDir));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api', fileRoutes);
app.use('/api', blockchainRoutes);

// SPA fallback - serve index.html for all non-API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BlockSecure Backend Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
