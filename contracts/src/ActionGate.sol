// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {MandateRegistry} from "./MandateRegistry.sol";
import {AgentRegistry} from "./AgentRegistry.sol";
import {AgentBonding} from "./AgentBonding.sol";
import {TraceCommitment} from "./TraceCommitment.sol";

contract ActionGate {
    enum Verdict {
        APPROVED,
        REJECTED
    }

    struct ActionProposal {
        uint256 mandateId;
        uint256 agentId;
        bytes32 actionId;
        bytes32 actionType;
        address target;
        address recipient;
        address asset;
        uint256 amount;
        bytes32 traceRoot;
        string storageURI;
    }

    MandateRegistry public immutable mandateRegistry;
    AgentRegistry public immutable agentRegistry;
    AgentBonding public immutable bonding;
    TraceCommitment public immutable traceCommitment;

    uint256 public slashAmount = 0.25 ether;

    event ActionApproved(
        bytes32 indexed actionId,
        uint256 indexed agentId,
        uint256 indexed mandateId,
        bytes32 traceRoot,
        string storageURI
    );
    event ActionRejected(
        bytes32 indexed actionId,
        uint256 indexed agentId,
        uint256 indexed mandateId,
        bytes32 traceRoot,
        string storageURI,
        uint256 reasonBitmap,
        uint256 slashed
    );

    error AgentInactive();

    uint256 public constant VIOLATION_AMOUNT = 1 << 0;
    uint256 public constant VIOLATION_TARGET = 1 << 1;
    uint256 public constant VIOLATION_RECIPIENT = 1 << 2;
    uint256 public constant VIOLATION_ACTION_NOT_ALLOWED = 1 << 3;
    uint256 public constant VIOLATION_ACTION_FORBIDDEN = 1 << 4;
    uint256 public constant VIOLATION_ASSET = 1 << 5;

    constructor(
        MandateRegistry _mandateRegistry,
        AgentRegistry _agentRegistry,
        AgentBonding _bonding,
        TraceCommitment _traceCommitment
    ) {
        mandateRegistry = _mandateRegistry;
        agentRegistry = _agentRegistry;
        bonding = _bonding;
        traceCommitment = _traceCommitment;
    }

    function submitAction(ActionProposal calldata proposal)
        external
        returns (Verdict verdict, uint256 reasonBitmap, uint256 slashed)
    {
        if (!agentRegistry.isActive(proposal.agentId)) revert AgentInactive();
        MandateRegistry.Mandate memory mandate = mandateRegistry.requireActive(proposal.mandateId);
        reasonBitmap = evaluate(proposal, mandate);

        if (reasonBitmap == 0) {
            verdict = Verdict.APPROVED;
            traceCommitment.commitTrace(
                proposal.actionId,
                proposal.agentId,
                proposal.mandateId,
                proposal.traceRoot,
                proposal.storageURI,
                uint8(verdict)
            );
            bonding.rewardApproval(proposal.agentId);
            emit ActionApproved(
                proposal.actionId,
                proposal.agentId,
                proposal.mandateId,
                proposal.traceRoot,
                proposal.storageURI
            );
        } else {
            verdict = Verdict.REJECTED;
            traceCommitment.commitTrace(
                proposal.actionId,
                proposal.agentId,
                proposal.mandateId,
                proposal.traceRoot,
                proposal.storageURI,
                uint8(verdict)
            );
            slashed = bonding.slash(proposal.agentId, slashAmount);
            emit ActionRejected(
                proposal.actionId,
                proposal.agentId,
                proposal.mandateId,
                proposal.traceRoot,
                proposal.storageURI,
                reasonBitmap,
                slashed
            );
        }
    }

    function preview(ActionProposal calldata proposal)
        external
        view
        returns (Verdict verdict, uint256 reasonBitmap)
    {
        MandateRegistry.Mandate memory mandate = mandateRegistry.requireActive(proposal.mandateId);
        reasonBitmap = evaluate(proposal, mandate);
        verdict = reasonBitmap == 0 ? Verdict.APPROVED : Verdict.REJECTED;
    }

    function evaluate(ActionProposal calldata proposal, MandateRegistry.Mandate memory mandate)
        public
        view
        returns (uint256 reasonBitmap)
    {
        if (proposal.amount > mandate.maxAmount) reasonBitmap |= VIOLATION_AMOUNT;
        if (!mandateRegistry.allowedTargets(proposal.mandateId, proposal.target)) {
            reasonBitmap |= VIOLATION_TARGET;
        }
        if (mandateRegistry.blockedRecipients(proposal.mandateId, proposal.recipient)) {
            reasonBitmap |= VIOLATION_RECIPIENT;
        }
        if (!mandateRegistry.allowedActionTypes(proposal.mandateId, proposal.actionType)) {
            reasonBitmap |= VIOLATION_ACTION_NOT_ALLOWED;
        }
        if (mandateRegistry.forbiddenActionTypes(proposal.mandateId, proposal.actionType)) {
            reasonBitmap |= VIOLATION_ACTION_FORBIDDEN;
        }
        if (proposal.asset != mandate.asset) reasonBitmap |= VIOLATION_ASSET;
    }
}
