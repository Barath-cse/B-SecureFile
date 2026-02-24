// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileSecure {
    struct File {
        string hash;
        address owner;
    }

    uint public fileCount;
    mapping(uint => File) public files;
    mapping(uint => mapping(address => bool)) public access;

    event FileUploaded(uint indexed fileId, string hash, address indexed owner);
    event AccessGranted(uint indexed fileId, address indexed user);

    function uploadFile(string calldata _hash) external {
        fileCount++;
        files[fileCount] = File(_hash, msg.sender);
        emit FileUploaded(fileCount, _hash, msg.sender);
    }

    function verifyFile(string calldata _hash) external view returns (bool) {
        for (uint i = 1; i <= fileCount; i++) {
            if (
                keccak256(bytes(files[i].hash)) == keccak256(bytes(_hash))
            ) return true;
        }
        return false;
    }

    function grantAccess(uint fileId, address user) external {
        require(msg.sender == files[fileId].owner, "Not owner");
        access[fileId][user] = true;
        emit AccessGranted(fileId, user);
    }

    function hasAccess(uint fileId, address user)
        external
        view
        returns (bool)
    {
        return access[fileId][user];
    }

    function getFileDetails(uint fileId)
        external
        view
        returns (string memory, address)
    {
        File memory f = files[fileId];
        return (f.hash, f.owner);
    }
}
