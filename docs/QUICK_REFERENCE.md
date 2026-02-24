# Quick Reference

## API Endpoints

| Method | URL                     | Description                         |
|--------|-------------------------|-------------------------------------|
| POST   | `/api/upload`           | Upload encrypted file              |
| GET    | `/api/file/:fileId`     | Download file                     |
| GET    | `/api/verify/:fileId`   | Verify hash                         |
| POST   | `/api/grant-access`     | Grant access permission            |
| GET    | `/api/user-files/:addr` | List files for a user              |

## Smart Contract Functions

- `uploadFile(string hash)`
- `verifyFile(string hash)`
- `grantAccess(uint fileId, address user)`
- `hasAccess(uint fileId, address user)`
- `getFileDetails(uint fileId)`

## Important Files

- `frontend/src/utils/crypto.js` – encryption helpers
- `backend/routes/fileRoutes.js` – API logic for uploads/verification
- `contracts/FileSecure.sol` – Solidity smart contract

Keep this sheet handy when navigating the codebase.