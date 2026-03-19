const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const fileRoutes = require('./routes/fileRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // update later with frontend URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', fileRoutes);
app.use('/api', blockchainRoutes);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check route (VERY useful)
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});