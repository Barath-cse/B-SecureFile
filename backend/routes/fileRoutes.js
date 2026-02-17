const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `${timestamp}-${random}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// File upload endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { fileName, owner, fileHash, encryptionKey } = req.body;

    if (!fileName || !owner || !fileHash || !encryptionKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // File metadata
    const fileMetadata = {
      id: req.file.filename,
      originalName: fileName,
      storagePath: req.file.path,
      owner: owner,
      fileHash: fileHash,
      encryptionKey: encryptionKey,
      fileSize: req.file.size,
      uploadedAt: new Date().toISOString(),
      mimeType: req.file.mimetype
    };

    // Save metadata to file
    const metadataPath = path.join(__dirname, '../uploads', `${req.file.filename}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(fileMetadata, null, 2));

    console.log('File uploaded:', fileMetadata);

    res.json({
      message: 'File uploaded successfully',
      fileId: req.file.filename,
      metadata: fileMetadata
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download file endpoint
router.get('/file/:fileId', (req, res) => {
  try {
    const { fileId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Find the file
    const files = fs.readdirSync(uploadsDir);
    const fileMatch = files.find(f => f.startsWith(fileId) && !f.endsWith('.json'));

    if (!fileMatch) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, fileMatch);
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get file metadata
router.get('/file-metadata/:fileId', (req, res) => {
  try {
    const { fileId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    const metadataPath = path.join(uploadsDir, `${fileId}.json`);

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Metadata not found' });
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    res.json(metadata);
  } catch (error) {
    console.error('Metadata error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user files
router.get('/user-files/:userAddress', (req, res) => {
  try {
    const { userAddress } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');

    const files = fs.readdirSync(uploadsDir);
    const userFiles = [];

    files.forEach(file => {
      if (file.endsWith('.json')) {
        const metadataPath = path.join(uploadsDir, file);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        
        if (metadata.owner.toLowerCase() === userAddress.toLowerCase()) {
          userFiles.push(metadata);
        }
      }
    });

    res.json({
      userAddress,
      fileCount: userFiles.length,
      files: userFiles
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify file endpoint
router.post('/verify', upload.single('file'), (req, res) => {
  try {
    const { blockchainHash } = req.body;

    if (!blockchainHash || !req.file) {
      return res.status(400).json({ error: 'Missing file or blockchain hash' });
    }

    // Calculate file hash
    const hash = crypto.createHash('sha256');
    const fileContent = fs.readFileSync(req.file.path);
    hash.update(fileContent);
    const calculatedHash = hash.digest('hex');

    const isValid = calculatedHash.toLowerCase() === blockchainHash.toLowerCase();

    res.json({
      isValid,
      calculatedHash,
      blockchainHash,
      message: isValid ? '✅ File is authentic' : '⚠️ File has been tampered'
    });

    // Clean up uploaded verification file
    fs.unlinkSync(req.file.path);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
