// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Account {
    address public owner;
    string public uri;
    address public registry;

    event URIChanged(string uri);

    constructor(address _owner, string memory _uri) {
        owner = _owner;
        uri = _uri;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function setUri(string memory _uri) public onlyOwner {
        console.log("Setting URI to %s", _uri);
        uri = _uri;
        emit URIChanged(_uri);
    }

    receive() external payable {} // to support receiving ETH by default

    fallback() external payable {}
}

contract Registry {
    mapping(address => address) public accounts;
    address payable public owner;

    event AccountCreated(address sender, address account, uint when);

    constructor() payable {
        owner = payable(msg.sender);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function createAccount() public {
        // deploy a new account contract for the fid

        // ensure one account per fid
        require(accounts[msg.sender] == address(0), "Account already exists");

        // TODO check address is farcaster verified address

        Account account = new Account(msg.sender, "");
        accounts[msg.sender] = address(account);
        emit AccountCreated(msg.sender, address(account), block.timestamp);
    }

    receive() external payable {} // to support receiving ETH by default

    fallback() external payable {}
}
