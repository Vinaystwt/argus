// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract TraceCommitment {
    struct Commitment {
        uint256 agentId;
        uint256 mandateId;
        bytes32 actionId;
        bytes32 traceRoot;
        string storageURI;
        uint8 verdict;
        uint256 timestamp;
    }

    address public actionGate;
    mapping(bytes32 => Commitment) public commitments;

    event TraceCommitted(
        bytes32 indexed actionId,
        uint256 indexed agentId,
        uint256 indexed mandateId,
        bytes32 traceRoot,
        string storageURI,
        uint8 verdict
    );

    error NotActionGate();
    error TraceAlreadyCommitted();

    modifier onlyActionGate() {
        if (msg.sender != actionGate) revert NotActionGate();
        _;
    }

    function setActionGate(address _actionGate) external {
        if (actionGate != address(0)) revert NotActionGate();
        actionGate = _actionGate;
    }

    function commitTrace(
        bytes32 actionId,
        uint256 agentId,
        uint256 mandateId,
        bytes32 traceRoot,
        string calldata storageURI,
        uint8 verdict
    ) external onlyActionGate {
        if (commitments[actionId].timestamp != 0) revert TraceAlreadyCommitted();
        commitments[actionId] = Commitment({
            agentId: agentId,
            mandateId: mandateId,
            actionId: actionId,
            traceRoot: traceRoot,
            storageURI: storageURI,
            verdict: verdict,
            timestamp: block.timestamp
        });
        emit TraceCommitted(actionId, agentId, mandateId, traceRoot, storageURI, verdict);
    }

    function getCommitment(bytes32 actionId) external view returns (Commitment memory) {
        return commitments[actionId];
    }
}
