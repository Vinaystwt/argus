// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AgentRegistry} from "./AgentRegistry.sol";

contract AgentBonding {
    AgentRegistry public immutable agentRegistry;
    address public actionGate;

    mapping(uint256 => uint256) public bondBalance;
    mapping(uint256 => uint256) public complianceScore;

    uint256 public constant STARTING_SCORE = 800;
    uint256 public constant APPROVAL_REWARD = 5;
    uint256 public constant SLASH_PENALTY = 200;

    event ActionGateSet(address indexed actionGate);
    event BondPosted(uint256 indexed agentId, address indexed funder, uint256 amount, uint256 newBalance);
    event AgentSlashed(uint256 indexed agentId, uint256 amount, uint256 newBalance);
    event ComplianceScoreUpdated(uint256 indexed agentId, uint256 oldScore, uint256 newScore);

    error NotAgentOwner();
    error NotActionGate();
    error InvalidBond();

    constructor(AgentRegistry _agentRegistry) {
        agentRegistry = _agentRegistry;
    }

    modifier onlyActionGate() {
        if (msg.sender != actionGate) revert NotActionGate();
        _;
    }

    function setActionGate(address _actionGate) external {
        if (actionGate != address(0)) revert NotActionGate();
        actionGate = _actionGate;
        emit ActionGateSet(_actionGate);
    }

    function postBond(uint256 agentId) external payable {
        if (agentRegistry.ownerOf(agentId) != msg.sender) revert NotAgentOwner();
        if (msg.value == 0) revert InvalidBond();
        if (complianceScore[agentId] == 0) {
            complianceScore[agentId] = STARTING_SCORE;
            emit ComplianceScoreUpdated(agentId, 0, STARTING_SCORE);
        }
        bondBalance[agentId] += msg.value;
        emit BondPosted(agentId, msg.sender, msg.value, bondBalance[agentId]);
    }

    function rewardApproval(uint256 agentId) external onlyActionGate {
        uint256 oldScore = complianceScore[agentId];
        if (oldScore == 0) oldScore = STARTING_SCORE;
        uint256 newScore = oldScore + APPROVAL_REWARD;
        if (newScore > 1000) newScore = 1000;
        complianceScore[agentId] = newScore;
        emit ComplianceScoreUpdated(agentId, oldScore, newScore);
    }

    function slash(uint256 agentId, uint256 requestedAmount) external onlyActionGate returns (uint256 slashed) {
        uint256 balance = bondBalance[agentId];
        slashed = requestedAmount > balance ? balance : requestedAmount;
        bondBalance[agentId] = balance - slashed;

        uint256 oldScore = complianceScore[agentId];
        if (oldScore == 0) oldScore = STARTING_SCORE;
        uint256 newScore = oldScore > SLASH_PENALTY ? oldScore - SLASH_PENALTY : 0;
        complianceScore[agentId] = newScore;

        emit AgentSlashed(agentId, slashed, bondBalance[agentId]);
        emit ComplianceScoreUpdated(agentId, oldScore, newScore);
    }
}
