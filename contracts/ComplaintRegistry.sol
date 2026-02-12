pragma solidity ^0.8.20;

contract ComplaintRegistry {
    struct Complaint {
        address reporter;
        bytes32 contentHash;
        uint8 severity;
        uint256 timestamp;
        bool closed;
    }

    mapping(bytes32 => Complaint) private complaints;
    event ComplaintSubmitted(bytes32 indexed id, address indexed reporter, uint8 severity);
    event ComplaintClosed(bytes32 indexed id, address indexed closer);

    function submit(bytes32 id, bytes32 contentHash, uint8 severity) external {
        require(complaints[id].timestamp == 0, "exists");
        complaints[id] = Complaint(msg.sender, contentHash, severity, block.timestamp, false);
        emit ComplaintSubmitted(id, msg.sender, severity);
    }

    function close(bytes32 id) external {
        Complaint storage c = complaints[id];
        require(c.timestamp != 0, "missing");
        require(!c.closed, "closed");
        c.closed = true;
        emit ComplaintClosed(id, msg.sender);
    }

    function get(bytes32 id) external view returns (address, bytes32, uint8, uint256, bool) {
        Complaint memory c = complaints[id];
        return (c.reporter, c.contentHash, c.severity, c.timestamp, c.closed);
    }
}
