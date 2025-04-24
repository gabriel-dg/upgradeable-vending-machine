// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VendingMachineV4 is Initializable {
    // Original state variables - DO NOT CHANGE ORDER
    uint public numSodas;
    address public owner;

    // V2 variables (if they exist in V2)
    uint public sodaPrice;

    // V3 variables (if any exist)

    // New V4 state variables - focus on simple storage changes
    uint public v4StateVariable; // Adding this should force a new implementation

    function initialize(uint _numSodas) public initializer {
        numSodas = _numSodas;
        owner = msg.sender;
        sodaPrice = 1000 wei;
        v4StateVariable = 42; // Set an initial value
    }

    function purchaseSoda() public payable {
        require(msg.value >= sodaPrice, "You must pay enough for a soda!");
        numSodas--;
    }

    function version() public pure returns (string memory) {
        return "4.0.0";
    }

    function getV4Variable() public view returns (uint) {
        return v4StateVariable;
    }

    function setV4Variable(uint _value) public onlyOwner {
        v4StateVariable = _value;
    }

    function setSodaPrice(uint _price) public onlyOwner {
        sodaPrice = _price;
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "No funds to withdraw");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}
