// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {AgentBonding} from "../src/AgentBonding.sol";
import {TraceCommitment} from "../src/TraceCommitment.sol";
import {ActionGate} from "../src/ActionGate.sol";

contract ArgusFullSuiteTest is Test {
    // ─── Contracts ───────────────────────────────────────────────────────────
    MandateRegistry mandateRegistry;
    AgentRegistry agentRegistry;
    AgentBonding bonding;
    TraceCommitment traceCommitment;
    ActionGate actionGate;

    // ─── Actors ──────────────────────────────────────────────────────────────
    address dao = address(0xDA0);
    address agentOwner = address(0xA11CE);
    address stranger = address(0xBEEF);
    address allowedTarget = address(0xADD1);
    address blockedAddr = address(0xBAD);
    address asset = address(0xA55E7); // mock ERC-20 address (no code needed for mandate checks)

    // ─── Action type constants ────────────────────────────────────────────────
    bytes32 constant SWAP = keccak256("swap");
    bytes32 constant FORBIDDEN_ACTION = keccak256("external_transfer");
    bytes32 constant UNLISTED_ACTION = keccak256("unknown_call");

    // ─── Shared setUp ─────────────────────────────────────────────────────────
    uint256 mandateId;
    uint256 agentId;

    function setUp() public {
        // Deploy
        mandateRegistry = new MandateRegistry();
        agentRegistry = new AgentRegistry();
        bonding = new AgentBonding(agentRegistry);
        traceCommitment = new TraceCommitment();
        actionGate = new ActionGate(mandateRegistry, agentRegistry, bonding, traceCommitment);

        // Wire up
        bonding.setActionGate(address(actionGate));
        traceCommitment.setActionGate(address(actionGate));

        // Create a baseline mandate
        address[] memory targets = new address[](1);
        targets[0] = allowedTarget;

        address[] memory blocked = new address[](1);
        blocked[0] = blockedAddr;

        bytes32[] memory allowedActions = new bytes32[](1);
        allowedActions[0] = SWAP;

        bytes32[] memory forbiddenActions = new bytes32[](1);
        forbiddenActions[0] = FORBIDDEN_ACTION;

        vm.prank(dao);
        mandateId = mandateRegistry.createMandate(
            "Treasury Ops",
            asset,
            1000 ether,
            targets,
            blocked,
            allowedActions,
            forbiddenActions
        );

        // Register agent and post bond
        vm.prank(agentOwner);
        agentId = agentRegistry.registerAgent("Argus Agent", "agent://argus/full-suite");
        vm.deal(agentOwner, 10 ether);
        vm.prank(agentOwner);
        bonding.postBond{value: 1 ether}(agentId);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /// Build a fully compliant proposal.
    function _compliantProposal(bytes32 actionId) internal view returns (ActionGate.ActionProposal memory) {
        return ActionGate.ActionProposal({
            mandateId: mandateId,
            agentId: agentId,
            actionId: actionId,
            actionType: SWAP,
            target: allowedTarget,
            recipient: dao, // not blocked
            asset: asset,
            amount: 100 ether, // within maxAmount
            traceRoot: keccak256(abi.encodePacked("root", actionId)),
            storageURI: "0g://compliant"
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. Mandate creation — fields stored correctly
    // ═══════════════════════════════════════════════════════════════════════════
    function testMandateCreationStoresFields() public {
        address[] memory targets = new address[](0);
        address[] memory blocked = new address[](0);
        bytes32[] memory allowedActions = new bytes32[](0);
        bytes32[] memory forbiddenActions = new bytes32[](0);

        vm.prank(dao);
        uint256 newId = mandateRegistry.createMandate(
            "New Mandate",
            asset,
            500 ether,
            targets,
            blocked,
            allowedActions,
            forbiddenActions
        );

        (address storedDao, string memory name, address storedAsset, uint256 maxAmount, bool active) =
            mandateRegistry.mandates(newId);
        assertEq(storedDao, dao);
        assertEq(name, "New Mandate");
        assertEq(storedAsset, asset);
        assertEq(maxAmount, 500 ether);
        assertTrue(active);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. Agent registration — label, owner, isActive=true
    // ═══════════════════════════════════════════════════════════════════════════
    function testAgentRegistrationStoresFields() public {
        vm.prank(stranger);
        uint256 newId = agentRegistry.registerAgent("New Agent", "agent://argus/new");

        (address owner, string memory label,, bool active) = agentRegistry.agents(newId);
        assertEq(owner, stranger);
        assertEq(label, "New Agent");
        assertTrue(active);
        assertEq(agentRegistry.ownerOf(newId), stranger);
        assertTrue(agentRegistry.isActive(newId));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. Bond posting — bondBalance set, score initialised to 800
    // ═══════════════════════════════════════════════════════════════════════════
    function testPostBondSetsBondBalanceAndInitScore() public {
        // Register a fresh agent with no prior bond
        vm.prank(stranger);
        uint256 freshId = agentRegistry.registerAgent("Fresh Agent", "agent://fresh");
        vm.deal(stranger, 2 ether);
        vm.prank(stranger);
        bonding.postBond{value: 1 ether}(freshId);

        assertEq(bonding.bondBalance(freshId), 1 ether);
        assertEq(bonding.complianceScore(freshId), bonding.STARTING_SCORE()); // 800
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. Compliant action approved — clean isolated version
    // ═══════════════════════════════════════════════════════════════════════════
    function testCompliantActionApproved() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-4"));
        (ActionGate.Verdict verdict, uint256 bitmap, uint256 slashed) = actionGate.submitAction(p);

        assertEq(uint8(verdict), uint8(ActionGate.Verdict.APPROVED));
        assertEq(bitmap, 0);
        assertEq(slashed, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. Amount violation
    // ═══════════════════════════════════════════════════════════════════════════
    function testAmountViolation() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-5"));
        p.amount = 1001 ether; // exceeds maxAmount=1000

        (, uint256 bitmap,) = actionGate.submitAction(p);
        assertTrue(bitmap & actionGate.VIOLATION_AMOUNT() != 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. Blocked recipient violation
    // ═══════════════════════════════════════════════════════════════════════════
    function testBlockedRecipientViolation() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-6"));
        p.recipient = blockedAddr;

        (, uint256 bitmap,) = actionGate.submitAction(p);
        assertTrue(bitmap & actionGate.VIOLATION_RECIPIENT() != 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 7. Forbidden action type violation
    // ═══════════════════════════════════════════════════════════════════════════
    function testForbiddenActionTypeViolation() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-7"));
        p.actionType = FORBIDDEN_ACTION;

        (, uint256 bitmap,) = actionGate.submitAction(p);
        assertTrue(bitmap & actionGate.VIOLATION_ACTION_FORBIDDEN() != 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 8. Target not in allowed list
    // ═══════════════════════════════════════════════════════════════════════════
    function testTargetNotAllowedViolation() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-8"));
        p.target = address(0x9999); // not in allowedTargets

        (, uint256 bitmap,) = actionGate.submitAction(p);
        assertTrue(bitmap & actionGate.VIOLATION_TARGET() != 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 9. Wrong asset violation
    // ═══════════════════════════════════════════════════════════════════════════
    function testWrongAssetViolation() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-9"));
        p.asset = address(0xDEAD); // wrong asset

        (, uint256 bitmap,) = actionGate.submitAction(p);
        assertTrue(bitmap & actionGate.VIOLATION_ASSET() != 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 10. Unregistered agent reverts with InvalidAgent
    // ═══════════════════════════════════════════════════════════════════════════
    function testUnregisteredAgentReverts() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-10"));
        p.agentId = 9999; // does not exist

        vm.expectRevert(AgentRegistry.InvalidAgent.selector);
        actionGate.submitAction(p);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 11. Inactive agent reverts with AgentInactive
    // ═══════════════════════════════════════════════════════════════════════════
    function testInactiveAgentReverts() public {
        vm.prank(agentOwner);
        agentRegistry.setActive(agentId, false);

        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-11"));

        vm.expectRevert(ActionGate.AgentInactive.selector);
        actionGate.submitAction(p);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 12. Inactive mandate reverts with MandateInactive
    // ═══════════════════════════════════════════════════════════════════════════
    function testInactiveMandateReverts() public {
        vm.prank(dao);
        mandateRegistry.setActive(mandateId, false);

        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-12"));

        vm.expectRevert(MandateRegistry.MandateInactive.selector);
        actionGate.submitAction(p);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 13. Trace root committed on approval
    // ═══════════════════════════════════════════════════════════════════════════
    function testTraceRootCommittedOnApproval() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-13"));
        actionGate.submitAction(p);

        TraceCommitment.Commitment memory c = traceCommitment.getCommitment(p.actionId);
        assertEq(c.traceRoot, p.traceRoot);
        assertEq(c.agentId, agentId);
        assertEq(c.mandateId, mandateId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 14. Storage URI committed
    // ═══════════════════════════════════════════════════════════════════════════
    function testStorageURICommitted() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-14"));
        p.storageURI = "0g://my-unique-storage-uri";
        actionGate.submitAction(p);

        TraceCommitment.Commitment memory c = traceCommitment.getCommitment(p.actionId);
        assertEq(c.storageURI, "0g://my-unique-storage-uri");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 15. Violation emits ActionRejected event
    // ═══════════════════════════════════════════════════════════════════════════
    function testViolationEmitsActionRejectedEvent() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-15"));
        p.amount = 9999 ether; // triggers VIOLATION_AMOUNT

        uint256 expectedBitmap = actionGate.VIOLATION_AMOUNT();

        vm.expectEmit(true, true, true, false); // check indexed fields, skip data
        emit ActionGate.ActionRejected(
            p.actionId,
            p.agentId,
            p.mandateId,
            p.traceRoot,
            p.storageURI,
            expectedBitmap,
            0.25 ether
        );
        actionGate.submitAction(p);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 16. Slash reduces bond
    // ═══════════════════════════════════════════════════════════════════════════
    function testSlashReducesBond() public {
        uint256 balanceBefore = bonding.bondBalance(agentId);

        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-16"));
        p.amount = 9999 ether; // violation to trigger slash

        (,, uint256 slashed) = actionGate.submitAction(p);

        assertEq(slashed, actionGate.slashAmount());
        assertEq(bonding.bondBalance(agentId), balanceBefore - actionGate.slashAmount());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 17. Compliance score decreases after violation
    // ═══════════════════════════════════════════════════════════════════════════
    function testComplianceScoreDecreasesAfterViolation() public {
        uint256 scoreBefore = bonding.complianceScore(agentId); // 800

        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-17"));
        p.amount = 9999 ether;

        actionGate.submitAction(p);

        assertEq(bonding.complianceScore(agentId), scoreBefore - bonding.SLASH_PENALTY()); // 600
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 18. Compliance score increases after approval
    // ═══════════════════════════════════════════════════════════════════════════
    function testComplianceScoreIncreasesAfterApproval() public {
        uint256 scoreBefore = bonding.complianceScore(agentId); // 800

        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-18"));
        actionGate.submitAction(p);

        assertEq(bonding.complianceScore(agentId), scoreBefore + bonding.APPROVAL_REWARD()); // 805
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 19. Repeated violations clamp score at 0  (4 violations: 800→600→400→200→0)
    // ═══════════════════════════════════════════════════════════════════════════
    function testRepeatedViolationsClampsScoreToZero() public {
        // Need enough bond to be slashed 4 times
        vm.prank(agentOwner);
        bonding.postBond{value: 9 ether}(agentId); // now have 10 ether total

        for (uint256 i = 0; i < 4; i++) {
            ActionGate.ActionProposal memory p = _compliantProposal(keccak256(abi.encodePacked("action-19-", i)));
            p.amount = 9999 ether;
            actionGate.submitAction(p);
        }

        assertEq(bonding.complianceScore(agentId), 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 20. Preview does NOT change state
    // ═══════════════════════════════════════════════════════════════════════════
    function testPreviewDoesNotChangeState() public {
        uint256 bondBefore = bonding.bondBalance(agentId);
        uint256 scoreBefore = bonding.complianceScore(agentId);

        // Preview a violating proposal
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-20"));
        p.amount = 9999 ether;

        (ActionGate.Verdict verdict, uint256 bitmap) = actionGate.preview(p);

        assertEq(uint8(verdict), uint8(ActionGate.Verdict.REJECTED));
        assertTrue(bitmap & actionGate.VIOLATION_AMOUNT() != 0);

        // State must be unchanged
        assertEq(bonding.bondBalance(agentId), bondBefore);
        assertEq(bonding.complianceScore(agentId), scoreBefore);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 21. Only actionGate can slash
    // ═══════════════════════════════════════════════════════════════════════════
    function testOnlyActionGateCanSlash() public {
        vm.prank(stranger);
        vm.expectRevert(AgentBonding.NotActionGate.selector);
        bonding.slash(agentId, 0.25 ether);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 22. Zero value bond rejected
    // ═══════════════════════════════════════════════════════════════════════════
    function testZeroValueBondReverts() public {
        vm.prank(agentOwner);
        vm.expectRevert(AgentBonding.InvalidBond.selector);
        bonding.postBond{value: 0}(agentId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 23. Non-owner cannot post bond
    // ═══════════════════════════════════════════════════════════════════════════
    function testNonOwnerCannotPostBond() public {
        vm.deal(stranger, 2 ether);
        vm.prank(stranger);
        vm.expectRevert(AgentBonding.NotAgentOwner.selector);
        bonding.postBond{value: 1 ether}(agentId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 24. Action not in allowed list → VIOLATION_ACTION_NOT_ALLOWED
    // ═══════════════════════════════════════════════════════════════════════════
    function testActionNotInAllowedListViolation() public {
        ActionGate.ActionProposal memory p = _compliantProposal(keccak256("action-24"));
        p.actionType = UNLISTED_ACTION; // not in allowedActionTypes and not explicitly forbidden

        (, uint256 bitmap,) = actionGate.submitAction(p);
        assertTrue(bitmap & actionGate.VIOLATION_ACTION_NOT_ALLOWED() != 0);
    }
}
