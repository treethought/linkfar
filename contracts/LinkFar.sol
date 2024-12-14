// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

struct Profile {
    address owner;
    string uri;
}

contract LinkFar is ERC1155, ERC1155Burnable, Ownable, ERC1155Supply {
    uint256 private nextProfileId;
    mapping(address => Profile) private addrProfiles;
    mapping(uint256 => Profile) private idProfiles;

    event ProfileCreated(uint256 indexed id, address indexed owner, string uri);
    event ProfileChanged(uint256 indexed id, address indexed owner, string uri);

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {
        nextProfileId = 1;
    }

    function mint(string memory _uri) public returns (uint256) {
        console.log("mint: %s", nextProfileId);
        // each address can only have one profile
        require(
           addrProfiles[msg.sender].owner == address(0),
            "Profile already exists"
        );

        console.log("mint: %s", nextProfileId);

        uint256 id = nextProfileId;
        nextProfileId += 1;

        addrProfiles[msg.sender] = Profile(msg.sender, _uri);
        idProfiles[id] = Profile(msg.sender, _uri);

        _mint(msg.sender, id, 1, "");
        emit ProfileChanged(id, msg.sender, _uri);
        console.log(
            "mint for address %s: id: %s, uri: %s",
            msg.sender,
            id,
            _uri
        );
        return id;
    }

    function getProfile(address _user) public view returns (Profile memory) {
        return addrProfiles[_user];
    }

    /// @notice Override the URI function to return the custom URI
    function uri(uint256 tokenId) public view override returns (string memory) {
        return idProfiles[tokenId].uri;
    }

    function updateProfile(string memory _uri) public {
        uint256 bal = balanceOf(msg.sender, 1);
        require(bal == 1, "Profile does not exist");
        addrProfiles[msg.sender].uri = _uri;
        emit ProfileChanged(1, msg.sender, _uri);
    }

    // The following functions are overrides required by Solidity.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
