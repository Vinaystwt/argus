// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MockAllowedTarget {
    event MockActionExecuted(bytes32 indexed actionType, address indexed asset, uint256 amount, address recipient);

    function executeMock(bytes32 actionType, address asset, uint256 amount, address recipient) external {
        emit MockActionExecuted(actionType, asset, amount, recipient);
    }
}
