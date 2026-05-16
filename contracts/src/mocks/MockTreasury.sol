// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract MockTreasury {
    address public dao;
    address public actionGate;

    event ActionGateSet(address indexed actionGate);

    error NotDao();
    error NotActionGate();

    constructor(address _dao) {
        dao = _dao;
    }

    receive() external payable {}

    function setActionGate(address _actionGate) external {
        if (msg.sender != dao) revert NotDao();
        actionGate = _actionGate;
        emit ActionGateSet(_actionGate);
    }

    function execute(address target, bytes calldata data) external returns (bytes memory result) {
        if (msg.sender != actionGate) revert NotActionGate();
        (bool ok, bytes memory ret) = target.call(data);
        require(ok, "TREASURY_EXECUTION_FAILED");
        return ret;
    }
}
