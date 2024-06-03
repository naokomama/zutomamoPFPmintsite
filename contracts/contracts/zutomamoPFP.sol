// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "erc721a/contracts/ERC721A.sol";

contract zutomamoPFP is ERC721A, AccessControl, Pausable {
    using Strings for uint256;

    // Manage
    bytes32 public constant ADMIN = "ADMIN";
    address public withdrawAddress;

    // Metadata
    string public baseURI;
    string public baseExtension;

    // SaleInfo
    uint256 public salesId;
    uint256 public maxSupply;
    uint256 public mintCost;
    bytes32 merkleRoot;
    mapping(uint256 => mapping(address => uint256)) public mintedAmountBySales;

    // Stages
    struct AllStageParams {
        uint256 highSchooler;
        uint256 workingAdult;
        uint256 marriage;
        uint256 family;
        uint256 oldAge;
        uint256 tomb;
    }
    AllStageParams public stageTimestamps;
    mapping(uint256 => string) public tokenStages;

    // Modifier
    modifier enoughEth(uint256 amount) {
        require(msg.value >= amount * mintCost, 'Not Enough Eth');
        _;
    }
    modifier withinMaxSupply(uint256 amount) {
        require(totalSupply() + amount <= maxSupply, 'Over Max Supply');
        _;
    }
    modifier withinMaxAmountPerAddress(address _to, uint256 amount, uint256 allowedAmount) {
        require(mintedAmountBySales[salesId][_to] + amount <= allowedAmount, 'Over Max Amount Per Address');
        _;
    }
    modifier validProof(address _to, uint256 allowedAmount, bytes32[] calldata merkleProof) {
        bytes32 node = keccak256(abi.encodePacked(_to, allowedAmount));
        require(MerkleProof.verifyCalldata(merkleProof, merkleRoot, node), "Invalid proof");
        _;
    }

    // Constructor
    constructor() ERC721A("zutomamoPFP", "ZMP") {
        _grantRole(ADMIN, msg.sender);
        setWithdrawAddress(msg.sender);
        pause();

        // Initialize stage timestamps
        stageTimestamps = AllStageParams({
            highSchooler: 0,
            // 2025.04.05 14:10
            workingAdult: 1743829800,
            // 2026.04.04 14:10
            marriage: 1775279400,
            // 2027.04.03 14:10
            family: 1806729000,
            // 2028.04.01 14:10
            oldAge: 1838178600,
            // 2029.04.07 14:10
            tomb: 1870233000
        });
    }

    // AirDrop
    function airdrop(address[] calldata _addresses, uint256[] calldata _amounts) external onlyRole(ADMIN) {
        require(_addresses.length == _amounts.length, 'Invalid Arguments');
        uint256 _supply = totalSupply();
        for (uint256 i = 0; i < _addresses.length; i++) {
            uint256 _amount = _amounts[i];
            if (_supply + _amount > maxSupply) continue;
            _mint(_addresses[i], _amount);
            _supply = _supply + _amount;
        }
    }

    // Mint
    function claim(uint256 _amount, uint256 _allowedAmount, bytes32[] calldata _merkleProof) external payable
        whenNotPaused
        enoughEth(_amount)
        withinMaxSupply(_amount)
        withinMaxAmountPerAddress(msg.sender, _amount, _allowedAmount)
        validProof(msg.sender, _allowedAmount, _merkleProof)
    {
        mintedAmountBySales[salesId][msg.sender] += _amount;
        _mint(msg.sender, _amount);
    }

    // Getter
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        string memory currentStage = _getCurrentStage(tokenId);
        string memory stage = tokenStages[tokenId];

        // Always use the current stage determined by the timestamp first
        stage = currentStage;

        // If a manual stage is set, override it
        if (bytes(tokenStages[tokenId]).length != 0) {
            stage = tokenStages[tokenId];
        }

        return string(abi.encodePacked(baseURI, tokenId.toString(), "/", stage, baseExtension));
    }

    function _getCurrentStage(uint256 /*_tokenId*/) private view returns (string memory) {
        uint256 currentTimestamp = block.timestamp;

        if (currentTimestamp >= stageTimestamps.tomb) {
            return "tomb";
        } else if (currentTimestamp >= stageTimestamps.oldAge) {
            return "old-age";
        } else if (currentTimestamp >= stageTimestamps.family) {
            return "family";
        } else if (currentTimestamp >= stageTimestamps.marriage) {
            return "marriage";
        } else if (currentTimestamp >= stageTimestamps.workingAdult) {
            return "working-adult";
        } else if (currentTimestamp >= stageTimestamps.highSchooler) {
            return "high-schooler";
        } else {
            return "elementary-school-student";
        }
    }

    // Setter
    function setWithdrawAddress(address _value) public onlyRole(ADMIN) {
        withdrawAddress = _value;
    }
    function setBaseURI(string memory _value) public onlyRole(ADMIN) {
        baseURI = _value;
    }
    function setBaseExtension(string memory _value) public onlyRole(ADMIN) {
        baseExtension = _value;
    }
    function resetBaseExtension() public onlyRole(ADMIN) {
        baseExtension = "";
    }
    function setSalesInfo(uint256 _salesId, uint256 _maxSupply, uint256 _mintCost, bytes32 _merkleRoot) public onlyRole(ADMIN) {
        salesId = _salesId;
        maxSupply = _maxSupply;
        mintCost = _mintCost;
        merkleRoot = _merkleRoot;
    }
    function setSalesId(uint256 _value) public onlyRole(ADMIN) {
        salesId = _value;
    }
    function setMaxSupply(uint256 _value) public onlyRole(ADMIN) {
        maxSupply = _value;
    }
    function setMintCost(uint256 _value) public onlyRole(ADMIN) {
        mintCost = _value;
    }
    function setMerkleRoot(bytes32 _value) public onlyRole(ADMIN) {
        merkleRoot = _value;
    }

    //   GROW STAGE
    function setIndividualStage(uint256 _tokenId, string memory _stage) public {
        require(ownerOf(_tokenId) == msg.sender || hasRole(ADMIN, msg.sender), "Not token owner or admin");
        tokenStages[_tokenId] = _stage;
    }

    function batchSetIndividualStage(uint256 tokenIdstart, uint256 tokenIdend, string memory stage) public onlyRole(ADMIN) {
        for (uint256 tokenId = tokenIdstart; tokenId <= tokenIdend; tokenId++) {
            tokenStages[tokenId] = stage;
        }
    }

    function clearIndividualStage(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender || hasRole(ADMIN, msg.sender), "Not token owner or admin");
        tokenStages[_tokenId] = "";
    }

    function setStageTimestamp(string memory stage, uint256 timestamp) public onlyRole(ADMIN) {
        if (keccak256(bytes(stage)) == keccak256(bytes("highSchooler"))) {
            stageTimestamps.highSchooler = timestamp;
        } else if (keccak256(bytes(stage)) == keccak256(bytes("workingAdult"))) {
            stageTimestamps.workingAdult = timestamp;
        } else if (keccak256(bytes(stage)) == keccak256(bytes("marriage"))) {
            stageTimestamps.marriage = timestamp;
        } else if (keccak256(bytes(stage)) == keccak256(bytes("family"))) {
            stageTimestamps.family = timestamp;
        } else if (keccak256(bytes(stage)) == keccak256(bytes("oldAge"))) {
            stageTimestamps.oldAge = timestamp;
        } else if (keccak256(bytes(stage)) == keccak256(bytes("tomb"))) {
            stageTimestamps.tomb = timestamp;
        } else {
            revert("Invalid stage name");
        }
    }

    function isHighSchooler() public view returns (bool) {
        return block.timestamp >= stageTimestamps.highSchooler;
    }

    function isWorkingAdult() public view returns (bool) {
        return block.timestamp >= stageTimestamps.workingAdult;
    }

    function isMarriage() public view returns (bool) {
        return block.timestamp >= stageTimestamps.marriage;
    }

    function isFamily() public view returns (bool) {
        return block.timestamp >= stageTimestamps.family;
    }

    function isOldAge() public view returns (bool) {
        return block.timestamp >= stageTimestamps.oldAge;
    }

    function isTomb() public view returns (bool) {
        return block.timestamp >= stageTimestamps.tomb;
    }

    // Pausable
    function pause() public onlyRole(ADMIN) {
        _pause();
    }
    function unpause() public onlyRole(ADMIN) {
        _unpause();
    }

    // AccessControl
    function grantRole(bytes32 role, address account) public override onlyRole(ADMIN) {
        _grantRole(role, account);
    }
    
    function revokeRole(bytes32 role, address account) public override onlyRole(ADMIN) {
        _revokeRole(role, account);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, AccessControl) returns (bool) {
        return ERC721A.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }

    function withdraw() public onlyRole(ADMIN) {
        (bool success,) = withdrawAddress.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}
