// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Uncomment this line to use console.log

struct Profile {
    address owner;
    string uri;
}

contract LinkFar is
    Initializable,
    ERC1155Upgradeable,
    OwnableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable
{
    uint256 private nextProfileId;
    mapping(address => Profile) private addrProfiles;
    mapping(uint256 => Profile) private idProfiles;

    event ProfileCreated(uint256 indexed id, address indexed owner, string uri);
    event ProfileChanged(uint256 indexed id, address indexed owner, string uri);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
        nextProfileId = 1;
    }

    function initialize(address initialOwner) public initializer {
        __ERC1155_init("");
        __Ownable_init(initialOwner);
        __ERC1155Burnable_init();
        __ERC1155Supply_init();
    }

    function mint(string memory _uri) public returns (uint256) {
        // each address can only have one profile
        require(
            addrProfiles[msg.sender].owner == address(0),
            "Profile already exists"
        );


        uint256 id = nextProfileId;
        nextProfileId += 1;

        addrProfiles[msg.sender] = Profile(msg.sender, _uri);
        idProfiles[id] = Profile(msg.sender, _uri);

        _mint(msg.sender, id, 1, "");
        emit ProfileChanged(id, msg.sender, _uri);
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

    // The following functions are overrides required by Solidity.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
        super._update(from, to, ids, values);
    }
}
