// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

struct Profile {
    address owner;
    string uri;
    string slug;
}

contract LinkFar is
    Initializable,
    ERC1155Upgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable
{
    uint256 private nextProfileId;
    mapping(uint256 => Profile) private idProfiles;
    mapping(address => uint256) private addrToId;
    mapping(string => uint256) private slugToId;

    event ProfileCreated(uint256 indexed id, address indexed owner, string uri);
    event ProfileChanged(uint256 indexed id, address indexed owner, string uri);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC1155_init("");
        __ERC1155Burnable_init();
        __ERC1155Supply_init();
    }

    function getVersion() public pure returns (string memory) {
        return "0.0.1";
    }

    function mint(string memory _uri) public returns (uint256) {
        // each address can only have one profile
        require(addrToId[msg.sender] == 0, "Profile already exists");

        nextProfileId += 1;
        uint256 id = nextProfileId;

        Profile memory profile = Profile(msg.sender, _uri, "");

        idProfiles[id] = profile;
        addrToId[msg.sender] = id;

        _mint(msg.sender, id, 1, "");
        emit ProfileCreated(id, msg.sender, _uri);
        return id;
    }

    function getProfile(address _user) public view returns (Profile memory) {
        uint256 id = addrToId[_user];
        return idProfiles[id];
    }

    function getProfileBySlug(
        string memory _slug
    ) public view returns (Profile memory) {
        return idProfiles[slugToId[_slug]];
    }

    /// @notice Override the URI function to return the custom URI
    function uri(uint256 tokenId) public view override returns (string memory) {
        return idProfiles[tokenId].uri;
    }

    function setSlug(string memory _slug) public {
        require(addrToId[msg.sender] != 0, "Profile does not exist");
        require(slugToId[_slug] == 0, "Slug already taken");
        uint256 id = addrToId[msg.sender];
        slugToId[_slug] = id;
        idProfiles[id].slug = _slug;
    }

    function updateProfile(string memory _uri) public {
        require(addrToId[msg.sender] != 0, "Profile does not exist");
        uint256 id = addrToId[msg.sender];
        idProfiles[id].uri = _uri;
        emit ProfileChanged(1, msg.sender, _uri);
    }

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
