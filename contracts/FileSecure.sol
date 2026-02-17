// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FileSecure
 * @dev Blockchain-based file integrity and access control system
 */
contract FileSecure {
    // File struct to store file metadata
    struct FileRecord {
        string fileHash;        // SHA-256 hash of the file
        address owner;          // Original uploader
        uint256 timestamp;      // Upload timestamp
        bool exists;            // Whether file is registered
    }

    // Mapping: fileHash => FileRecord
    mapping(string => FileRecord) public files;

    // Mapping: fileHash => list of addresses with access
    mapping(string => mapping(address => bool)) public accessControl;

    // Mapping: fileHash => list of all addresses with access
    mapping(string => address[]) public accessList;

    // Events
    event FileUploaded(
        string indexed fileHash,
        address indexed owner,
        uint256 timestamp
    );

    event AccessGranted(
        string indexed fileHash,
        address indexed grantedTo,
        address indexed grantedBy
    );

    event AccessRevoked(
        string indexed fileHash,
        address indexed revokedFrom,
        address indexed revokedBy
    );

    /**
     * @dev Upload a file hash to the blockchain
     * @param _fileHash SHA-256 hash of the file
     */
    function uploadFile(string memory _fileHash) public {
        require(bytes(_fileHash).length > 0, "File hash cannot be empty");
        require(!files[_fileHash].exists, "File already registered");

        files[_fileHash] = FileRecord({
            fileHash: _fileHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        // Owner has automatic access
        accessControl[_fileHash][msg.sender] = true;
        accessList[_fileHash].push(msg.sender);

        emit FileUploaded(_fileHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify if a file exists on blockchain
     * @param _fileHash SHA-256 hash to verify
     * @return bool True if file exists
     */
    function verifyFile(string memory _fileHash) public view returns (bool) {
        return files[_fileHash].exists;
    }

    /**
     * @dev Get file details
     * @param _fileHash SHA-256 hash of the file
     * @return fileHash The file hash
     * @return owner The file owner
     * @return timestamp Upload timestamp
     */
    function getFileDetails(string memory _fileHash)
        public
        view
        returns (
            string memory fileHash,
            address owner,
            uint256 timestamp
        )
    {
        require(files[_fileHash].exists, "File does not exist");

        FileRecord memory record = files[_fileHash];
        return (record.fileHash, record.owner, record.timestamp);
    }

    /**
     * @dev Grant access to a file
     * @param _fileHash SHA-256 hash of the file
     * @param _userAddress Address to grant access to
     */
    function grantAccess(string memory _fileHash, address _userAddress)
        public
    {
        require(files[_fileHash].exists, "File does not exist");
        require(files[_fileHash].owner == msg.sender, "Only file owner can grant access");
        require(_userAddress != address(0), "Invalid address");
        require(
            !accessControl[_fileHash][_userAddress],
            "User already has access"
        );

        accessControl[_fileHash][_userAddress] = true;
        accessList[_fileHash].push(_userAddress);

        emit AccessGranted(_fileHash, _userAddress, msg.sender);
    }

    /**
     * @dev Revoke access to a file
     * @param _fileHash SHA-256 hash of the file
     * @param _userAddress Address to revoke access from
     */
    function revokeAccess(string memory _fileHash, address _userAddress)
        public
    {
        require(files[_fileHash].exists, "File does not exist");
        require(files[_fileHash].owner == msg.sender, "Only file owner can revoke access");
        require(
            accessControl[_fileHash][_userAddress],
            "User does not have access"
        );

        accessControl[_fileHash][_userAddress] = false;

        emit AccessRevoked(_fileHash, _userAddress, msg.sender);
    }

    /**
     * @dev Check if user has access to a file
     * @param _fileHash SHA-256 hash of the file
     * @param _userAddress Address to check
     * @return bool True if user has access
     */
    function hasAccess(string memory _fileHash, address _userAddress)
        public
        view
        returns (bool)
    {
        require(files[_fileHash].exists, "File does not exist");
        return accessControl[_fileHash][_userAddress];
    }

    /**
     * @dev Get list of addresses with access to a file
     * @param _fileHash SHA-256 hash of the file
     * @return address[] Array of addresses with access
     */
    function getAccessList(string memory _fileHash)
        public
        view
        returns (address[] memory)
    {
        require(files[_fileHash].exists, "File does not exist");
        return accessList[_fileHash];
    }

    /**
     * @dev Get number of people with access to a file
     * @param _fileHash SHA-256 hash of the file
     * @return uint256 Number of people with access
     */
    function getAccessCount(string memory _fileHash)
        public
        view
        returns (uint256)
    {
        require(files[_fileHash].exists, "File does not exist");
        return accessList[_fileHash].length;
    }
}
