// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract AgentRegistry {
    struct Agent {
        address owner;
        string label;
        string metadataURI;
        bool active;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => Agent) public agents;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string label, string metadataURI);
    event AgentStatusChanged(uint256 indexed agentId, bool active);

    error NotAgentOwner();
    error InvalidAgent();

    function registerAgent(string calldata label, string calldata metadataURI) external returns (uint256 agentId) {
        agentId = nextAgentId++;
        agents[agentId] = Agent({owner: msg.sender, label: label, metadataURI: metadataURI, active: true});
        emit AgentRegistered(agentId, msg.sender, label, metadataURI);
    }

    function setActive(uint256 agentId, bool active) external {
        Agent storage agent = agents[agentId];
        if (agent.owner == address(0)) revert InvalidAgent();
        if (agent.owner != msg.sender) revert NotAgentOwner();
        agent.active = active;
        emit AgentStatusChanged(agentId, active);
    }

    function ownerOf(uint256 agentId) external view returns (address) {
        address owner = agents[agentId].owner;
        if (owner == address(0)) revert InvalidAgent();
        return owner;
    }

    function isActive(uint256 agentId) external view returns (bool) {
        Agent memory agent = agents[agentId];
        if (agent.owner == address(0)) revert InvalidAgent();
        return agent.active;
    }
}
