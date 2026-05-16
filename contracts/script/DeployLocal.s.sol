// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {AgentBonding} from "../src/AgentBonding.sol";
import {TraceCommitment} from "../src/TraceCommitment.sol";
import {ActionGate} from "../src/ActionGate.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {MockAllowedTarget} from "../src/mocks/MockAllowedTarget.sol";

contract DeployLocal is Script {
    function run() external {
        vm.startBroadcast();

        MockERC20 usdc = new MockERC20("Mock USDC", "mUSDC", 6);
        MockAllowedTarget uniswap = new MockAllowedTarget();
        MockAllowedTarget morpho = new MockAllowedTarget();
        MandateRegistry mandateRegistry = new MandateRegistry();
        AgentRegistry agentRegistry = new AgentRegistry();
        AgentBonding bonding = new AgentBonding(agentRegistry);
        TraceCommitment traceCommitment = new TraceCommitment();
        ActionGate actionGate = new ActionGate(mandateRegistry, agentRegistry, bonding, traceCommitment);
        bonding.setActionGate(address(actionGate));
        traceCommitment.setActionGate(address(actionGate));

        vm.stopBroadcast();

        console2.log("MockUSDC", address(usdc));
        console2.log("MockUniswap", address(uniswap));
        console2.log("MockMorpho", address(morpho));
        console2.log("MandateRegistry", address(mandateRegistry));
        console2.log("AgentRegistry", address(agentRegistry));
        console2.log("AgentBonding", address(bonding));
        console2.log("TraceCommitment", address(traceCommitment));
        console2.log("ActionGate", address(actionGate));
    }
}
