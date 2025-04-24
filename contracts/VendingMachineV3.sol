// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VendingMachineV3 is Initializable {
    // Original state variables - DO NOT CHANGE ORDER
    uint public numSodas;
    address public owner;

    // V2 variables (if any)
    uint public sodaPrice;

    // New V3 state variables
    uint public lastPurchaseTimestamp;
    address public lastBuyer;
    uint public totalSodaSold;
    mapping(address => uint) public purchasesByUser;
    bool public isPaused;
    uint8[10] public discountLevels;
    string public vendingMachineName;

    // Events - adding events can help change bytecode
    event SodaPurchased(address buyer, uint price, uint timestamp);
    event SodaRestocked(uint amount, uint newTotal);
    event PriceChanged(uint oldPrice, uint newPrice);
    event FundsWithdrawn(address owner, uint amount);

    // Constants
    string public constant VERSION = "3.0.0";

    // Initialize function (only called on first deployment)
    function initialize(uint _numSodas) public initializer {
        numSodas = _numSodas;
        owner = msg.sender;
        sodaPrice = 1000 wei;
        totalSodaSold = 0;
        isPaused = false;
        vendingMachineName = "Super Soda Machine v3";

        // Initialize discountLevels
        for (uint8 i = 0; i < 10; i++) {
            discountLevels[i] = 5 * i;
        }
    }

    // Significantly changed purchase function
    function purchaseSoda() public payable {
        require(!isPaused, "Vending machine is paused");
        require(msg.value >= sodaPrice, "You must pay enough for a soda!");
        require(numSodas > 0, "Out of stock!");

        numSodas--;
        totalSodaSold++;
        lastPurchaseTimestamp = block.timestamp;
        lastBuyer = msg.sender;
        purchasesByUser[msg.sender]++;

        // Give change if they paid too much
        uint change = msg.value - sodaPrice;
        if (change > 0) {
            (bool sent, ) = msg.sender.call{value: change}("");
            require(sent, "Failed to send change");
        }

        emit SodaPurchased(msg.sender, sodaPrice, block.timestamp);
    }

    // Version function that returns 3.0.0
    function version() public pure returns (string memory) {
        return VERSION;
    }

    // New function for V3
    function restockSodas(uint amount) public onlyOwner {
        numSodas += amount;
        emit SodaRestocked(amount, numSodas);
    }

    // New function for V3
    function getSalesInfo() public view returns (uint, uint, address) {
        return (totalSodaSold, lastPurchaseTimestamp, lastBuyer);
    }

    // New function for V3
    function getUserPurchases(address user) public view returns (uint) {
        return purchasesByUser[user];
    }

    // New function for V3
    function setPaused(bool _isPaused) public onlyOwner {
        isPaused = _isPaused;
    }

    // New function for V3
    function setVendingMachineName(string memory _name) public onlyOwner {
        vendingMachineName = _name;
    }

    // New function for V3
    function getDiscountForUser(address user) public view returns (uint8) {
        uint purchases = purchasesByUser[user];
        uint8 level = uint8(purchases / 10);
        if (level >= 10) level = 9;
        return discountLevels[level];
    }

    // Set soda price (from V2)
    function setSodaPrice(uint _price) public onlyOwner {
        uint oldPrice = sodaPrice;
        sodaPrice = _price;
        emit PriceChanged(oldPrice, _price);
    }

    // Withdraw function (possibly from V2)
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "No funds to withdraw");
        uint amount = address(this).balance;
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed");
        emit FundsWithdrawn(owner, amount);
    }

    // Owner check modifier
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}
