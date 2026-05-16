// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MandateRegistry {
    struct Mandate {
        address dao;
        string name;
        address asset;
        uint256 maxAmount;
        bool active;
    }

    uint256 public nextMandateId = 1;
    mapping(uint256 => Mandate) public mandates;
    mapping(uint256 => mapping(address => bool)) public allowedTargets;
    mapping(uint256 => mapping(address => bool)) public blockedRecipients;
    mapping(uint256 => mapping(bytes32 => bool)) public allowedActionTypes;
    mapping(uint256 => mapping(bytes32 => bool)) public forbiddenActionTypes;

    event MandateCreated(
        uint256 indexed mandateId,
        address indexed dao,
        string name,
        address asset,
        uint256 maxAmount
    );
    event TargetAllowed(uint256 indexed mandateId, address indexed target, bool allowed);
    event RecipientBlocked(uint256 indexed mandateId, address indexed recipient, bool blocked);
    event ActionTypeRule(uint256 indexed mandateId, bytes32 indexed actionType, bool allowed, bool forbidden);

    error NotDao();
    error MandateInactive();
    error InvalidMandate();

    function createMandate(
        string calldata name,
        address asset,
        uint256 maxAmount,
        address[] calldata targets,
        address[] calldata blocked,
        bytes32[] calldata allowedActions,
        bytes32[] calldata forbiddenActions
    ) external returns (uint256 mandateId) {
        mandateId = nextMandateId++;
        mandates[mandateId] = Mandate({
            dao: msg.sender,
            name: name,
            asset: asset,
            maxAmount: maxAmount,
            active: true
        });

        for (uint256 i = 0; i < targets.length; i++) {
            allowedTargets[mandateId][targets[i]] = true;
            emit TargetAllowed(mandateId, targets[i], true);
        }
        for (uint256 i = 0; i < blocked.length; i++) {
            blockedRecipients[mandateId][blocked[i]] = true;
            emit RecipientBlocked(mandateId, blocked[i], true);
        }
        for (uint256 i = 0; i < allowedActions.length; i++) {
            allowedActionTypes[mandateId][allowedActions[i]] = true;
            emit ActionTypeRule(mandateId, allowedActions[i], true, false);
        }
        for (uint256 i = 0; i < forbiddenActions.length; i++) {
            forbiddenActionTypes[mandateId][forbiddenActions[i]] = true;
            emit ActionTypeRule(mandateId, forbiddenActions[i], false, true);
        }

        emit MandateCreated(mandateId, msg.sender, name, asset, maxAmount);
    }

    function setActive(uint256 mandateId, bool active) external {
        Mandate storage mandate = mandates[mandateId];
        if (mandate.dao == address(0)) revert InvalidMandate();
        if (mandate.dao != msg.sender) revert NotDao();
        mandate.active = active;
    }

    function requireActive(uint256 mandateId) external view returns (Mandate memory mandate) {
        mandate = mandates[mandateId];
        if (mandate.dao == address(0)) revert InvalidMandate();
        if (!mandate.active) revert MandateInactive();
    }
}
