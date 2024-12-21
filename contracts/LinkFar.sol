// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

struct Profile {
    address owner;
    string uri;
    string slug;
}

contract LinkFar is
    Initializable,
    ERC1155Upgradeable,
    ERC1155BurnableUpgradeable
{
    uint256 private currentId;
    uint256 private supply;
    string private _name;
    string private metadataURI;
    mapping(uint256 => Profile) private idProfiles;
    mapping(address => uint256) private addrToId;
    mapping(string => uint256) private slugToId;

    event ProfileCreated(uint256 indexed id, address indexed owner, string uri);
    event ProfileChanged(uint256 indexed id, address indexed owner, string uri);
    event ProfileBurned(uint256 indexed id, address indexed owner);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        require(currentId == 0, "Already initialized");
        __ERC1155_init("");
        __ERC1155Burnable_init();
        // must only initialize this for v1
        // subsequent versions must not call this in initialize
        // so the storage persists
        currentId = 1;
        supply = 0;
        _name = "LinkFar";
        metadataURI = "ipfs://bafkreihw6snpq5f3qynocim47yuvpqq7xnlaptfisv6m3zsyhkdviwo6n4";
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function getVersion() public pure returns (string memory) {
        return "0.0.1";
    }

    function contractURI() public view returns (string memory) {
        return metadataURI;
    }

    function totalMinted() public view returns (uint256) {
        return currentId - 1;
    }

    function totalSupply() public view returns (uint256) {
        return supply;
    }

    function requireOwnerOf(uint256 id) private view {
        require(idProfiles[id].owner == msg.sender, "Not profile owner");
        require(addrToId[msg.sender] == id, "Not owner of profile id");
    }

    function requireHasProfile() private view {
        require(addrToId[msg.sender] != 0, "Profile does not exist");
    }

    function requireNotOwnsProfile() private view {
        require(addrToId[msg.sender] == 0, "Profile already exists");
    }

    function requireSlugAvailable(string memory normalized) private view {
        uint256 existingId = slugToId[normalized];
        if (existingId != 0) {
            require(existingId == addrToId[msg.sender], "Slug already taken");
        }
    }

    function mint(string memory _uri) public returns (uint256) {
        // each address can only have one profile
        requireNotOwnsProfile();

        uint256 id = currentId;
        currentId += 1;
        supply += 1;

        Profile memory profile = Profile(msg.sender, _uri, "");
        idProfiles[id] = profile;
        addrToId[msg.sender] = id;

        _mint(msg.sender, id, 1, "");
        emit ProfileCreated(id, msg.sender, _uri);
        return id;
    }

    function burn(address account, uint256 id, uint256 value) public override {
        requireOwnerOf(id);
        require(account == msg.sender, "Can only burn your own account");
        require(value == 1, "Value cannot exceed 1");

        // clean up mappings
        Profile memory profile = idProfiles[id];
        delete idProfiles[id];
        delete addrToId[msg.sender];

        if (bytes(profile.slug).length > 0) {
            delete slugToId[profile.slug];
        }

        supply -= 1;
        _burn(account, id, value);
        emit ProfileBurned(id, msg.sender);
    }

    function getProfile(address _user) public view returns (Profile memory) {
        uint256 id = addrToId[_user];
        return idProfiles[id];
    }

    function getIdByAddress(address _user) public view returns (uint256) {
        return addrToId[_user];
    }

    function getProfileBySlug(
        string memory _slug
    ) public view returns (Profile memory) {
        string memory normalized = normalizeSlug(_slug);
        uint256 id = slugToId[normalized];
        if (id == 0) {
            return Profile(address(0), "", "");
        }

        return idProfiles[id];
    }

    /// @notice Override the URI function to return the custom URI
    function uri(uint256 tokenId) public view override returns (string memory) {
        return idProfiles[tokenId].uri;
    }

    function setSlug(string memory _slug) public {
        requireHasProfile();

        string memory normalized = normalizeSlug(_slug);
        requireSlugAvailable(normalized);

        uint256 id = addrToId[msg.sender];
        requireOwnerOf(id);

        // remove existing slug
        string memory existing = idProfiles[id].slug;
        if (bytes(existing).length > 0) {
            delete slugToId[existing];
        }

        slugToId[normalized] = id;
        idProfiles[id].slug = normalized;
    }

    function updateProfile(string memory _uri) public {
        require(addrToId[msg.sender] != 0, "Profile does not exist");
        uint256 id = addrToId[msg.sender];
        idProfiles[id].uri = _uri;
        emit ProfileChanged(id, msg.sender, _uri);
    }

    function normalizeSlug(
        string memory _slug
    ) internal pure returns (string memory) {
        bytes memory b = bytes(_slug);
        for (uint i = 0; i < b.length; i++) {
            if (b[i] >= 0x41 && b[i] <= 0x5A) {
                // A-Z
                b[i] = bytes1(uint8(b[i]) + 32); // Convert to a-z
            }
        }
        return string(b);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory // data
    ) public override {
        requireOwnerOf(id);
        require(from == msg.sender, "Can only transfer your own account");
        require(value == 1, "Value cannot exceed 1");
        if (to == address(0)) {
            burn(from, id, value);
            return;
        }

        // update mappings
        addrToId[from] = 0;
        addrToId[to] = id;
        idProfiles[id].owner = to;

        // slug remains the same since it maps to id
        _safeTransferFrom(from, to, id, value, "");
    }

    function burnBatch(
        address, // account,
        uint256[] memory, // ids,
        uint256[] memory // values
    ) public pure override {
        revert("Batch burn not supported");
    }

    function safeBatchTransferFrom(
        address, // from,
        address, // to,
        uint256[] memory, // ids,
        uint256[] memory, // values,
        bytes memory // data
    ) public pure override {
        revert("Batch transfer not supported");
    }

    // The following functions are overrides required by Solidity.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155Upgradeable) {
        super._update(from, to, ids, values);
    }
}
