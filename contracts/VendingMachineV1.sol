// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VendingMachineV1 is Initializable {
    // these state variables and their values
    // will be preserved forever, regardless of upgrading
    // we can add new state variables, but we cannot remove or modify existing ones
    uint public numSodas;
    address public owner;

    function initialize(uint _numSodas) public initializer {
        numSodas = _numSodas;
        owner = msg.sender;
    }

    function purchaseSoda() public payable {
        require(msg.value >= 1000 wei, "You must pay 1000 wei for a soda!");
        numSodas--;
    }
}
