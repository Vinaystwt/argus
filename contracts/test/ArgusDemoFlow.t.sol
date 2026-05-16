// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {AgentBonding} from "../src/AgentBonding.sol";
import {TraceCommitment} from "../src/TraceCommitment.sol";
import {ActionGate} from "../src/ActionGate.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {MockAllowedTarget} from "../src/mocks/MockAllowedTarget.sol";

contract ArgusDemoFlowTest is Test {
    MandateRegistry mandateRegistry;
    AgentRegistry agentRegistry;
    AgentBonding bonding;
    TraceCommitment traceCommitment;
    ActionGate actionGate;
    MockERC20 usdc;
    MockAllowedTarget uniswap;
    MockAllowedTarget morpho;

    address dao = address(0xDA0);
    address agentOwner = address(0xA11CE);
    address badRecipient = address(0xBAD);
    uint256 mandateId;
    uint256 agentId;

    bytes32 constant SWAP = keccak256("swap");
    bytes32 constant REBALANCE = keccak256("rebalance");
    bytes32 constant REPAY = keccak256("repay");
    bytes32 constant EXTERNAL_TRANSFER = keccak256("external_transfer");
    bytes32 constant UNKNOWN_CALL = keccak256("unknown_call");
    bytes32 constant GOVERNANCE_VOTE = keccak256("governance_vote");

    function setUp() public {
        mandateRegistry = new MandateRegistry();
        agentRegistry = new AgentRegistry();
        bonding = new AgentBonding(agentRegistry);
        traceCommitment = new TraceCommitment();
        actionGate = new ActionGate(mandateRegistry, agentRegistry, bonding, traceCommitment);
        bonding.setActionGate(address(actionGate));
        traceCommitment.setActionGate(address(actionGate));
        usdc = new MockERC20("Mock USDC", "mUSDC", 6);
        uniswap = new MockAllowedTarget();
        morpho = new MockAllowedTarget();

        address[] memory targets = new address[](2);
        targets[0] = address(uniswap);
        targets[1] = address(morpho);

        address[] memory blocked = new address[](1);
        blocked[0] = badRecipient;

        bytes32[] memory allowed = new bytes32[](3);
        allowed[0] = REBALANCE;
        allowed[1] = REPAY;
        allowed[2] = SWAP;

        bytes32[] memory forbidden = new bytes32[](3);
        forbidden[0] = EXTERNAL_TRANSFER;
        forbidden[1] = UNKNOWN_CALL;
        forbidden[2] = GOVERNANCE_VOTE;

        vm.prank(dao);
        mandateId = mandateRegistry.createMandate(
            "Treasury Agent Constitution",
            address(usdc),
            500e6,
            targets,
            blocked,
            allowed,
            forbidden
        );

        vm.prank(agentOwner);
        agentId = agentRegistry.registerAgent("Argus Treasury Agent", "agent://argus/demo-agent");
        vm.deal(agentOwner, 2 ether);
        vm.prank(agentOwner);
        bonding.postBond{value: 1 ether}(agentId);
    }

    function testCompliantActionIsApprovedAndCommitted() public {
        ActionGate.ActionProposal memory proposal = ActionGate.ActionProposal({
            mandateId: mandateId,
            agentId: agentId,
            actionId: keccak256("action-compliant"),
            actionType: SWAP,
            target: address(uniswap),
            recipient: dao,
            asset: address(usdc),
            amount: 100e6,
            traceRoot: keccak256("trace-compliant"),
            storageURI: "0g://trace-compliant"
        });

        (ActionGate.Verdict verdict, uint256 reasonBitmap, uint256 slashed) = actionGate.submitAction(proposal);

        assertEq(uint8(verdict), uint8(ActionGate.Verdict.APPROVED));
        assertEq(reasonBitmap, 0);
        assertEq(slashed, 0);
        assertEq(bonding.bondBalance(agentId), 1 ether);
        assertEq(bonding.complianceScore(agentId), 805);

        TraceCommitment.Commitment memory commitment = traceCommitment.getCommitment(proposal.actionId);
        assertEq(commitment.traceRoot, proposal.traceRoot);
        assertEq(commitment.storageURI, proposal.storageURI);
        assertEq(commitment.verdict, uint8(ActionGate.Verdict.APPROVED));
    }

    function testPromptInjectedActionIsRejectedSlashedAndCommitted() public {
        ActionGate.ActionProposal memory proposal = ActionGate.ActionProposal({
            mandateId: mandateId,
            agentId: agentId,
            actionId: keccak256("action-malicious"),
            actionType: EXTERNAL_TRANSFER,
            target: address(0xDEAD),
            recipient: badRecipient,
            asset: address(usdc),
            amount: 2000e6,
            traceRoot: keccak256("trace-malicious"),
            storageURI: "0g://trace-malicious"
        });

        (ActionGate.Verdict verdict, uint256 reasonBitmap, uint256 slashed) = actionGate.submitAction(proposal);

        uint256 expected = actionGate.VIOLATION_AMOUNT()
            | actionGate.VIOLATION_TARGET()
            | actionGate.VIOLATION_RECIPIENT()
            | actionGate.VIOLATION_ACTION_NOT_ALLOWED()
            | actionGate.VIOLATION_ACTION_FORBIDDEN();

        assertEq(uint8(verdict), uint8(ActionGate.Verdict.REJECTED));
        assertEq(reasonBitmap, expected);
        assertEq(slashed, 0.25 ether);
        assertEq(bonding.bondBalance(agentId), 0.75 ether);
        assertEq(bonding.complianceScore(agentId), 600);

        TraceCommitment.Commitment memory commitment = traceCommitment.getCommitment(proposal.actionId);
        assertEq(commitment.traceRoot, proposal.traceRoot);
        assertEq(commitment.storageURI, proposal.storageURI);
        assertEq(commitment.verdict, uint8(ActionGate.Verdict.REJECTED));
    }

    function testPreviewMatchesRejectedPolicy() public view {
        ActionGate.ActionProposal memory proposal = ActionGate.ActionProposal({
            mandateId: mandateId,
            agentId: agentId,
            actionId: keccak256("preview-malicious"),
            actionType: GOVERNANCE_VOTE,
            target: address(morpho),
            recipient: dao,
            asset: address(usdc),
            amount: 1e6,
            traceRoot: keccak256("trace-preview"),
            storageURI: "0g://trace-preview"
        });

        (ActionGate.Verdict verdict, uint256 reasonBitmap) = actionGate.preview(proposal);
        assertEq(uint8(verdict), uint8(ActionGate.Verdict.REJECTED));
        assertTrue(reasonBitmap & actionGate.VIOLATION_ACTION_FORBIDDEN() != 0);
    }
}
