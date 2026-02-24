# Directory Structure

```
B-SecureFile/
├── backend/               # Node backend server
│   ├── routes/            # Express routes
│   ├── utils/             # Helper modules (crypto, etc.)
│   ├── uploads/           # Local file storage (from multer)
│   ├── server.js          # Entry point
│   └── package.json
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── utils/         # Crypto and hash utilities
│   │   └── App.js         # Main application
│   ├── public/            # Static assets
│   └── package.json
├── contracts/             # Solidity smart contracts
│   └── FileSecure.sol
├── docs/                  # Project documentation (this folder)
└── README.md              # Project entrypoint
```

Empty or deleted folders will reappear once files are added and committed.