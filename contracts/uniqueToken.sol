// Adapted from:
// https://github.com/m0t0k1ch1/ERC721-token-sample/blob/master/contracts/MyNonFungibleToken.sol

pragma solidity ^0.4.16;

import "./erc721.sol";

contract UniqueToken is ERC721 {
    
    address public owner;
    string public name;
    string public symbol;
    
    bytes4 constant InterfaceID_ERC165 = 
        bytes4(keccak256('supportsInterface(bytes4)'));
        
    bytes4 constant InterfaceID_ERC721 =
        bytes4(keccak256('name()')) ^
        bytes4(keccak256('symbol()')) ^
        bytes4(keccak256('totalSupply()')) ^
        bytes4(keccak256('balanceOf(address)')) ^
        bytes4(keccak256('ownerOf(uint256)')) ^
        bytes4(keccak256('approve(address,uint256)')) ^
        bytes4(keccak256('transfer(address,uint256)')) ^
        bytes4(keccak256('transferFrom(address,address,uint256)')) ^
        bytes4(keccak256('tokensOfOwner(address)'));
    
    struct Token {
        address mintedBy;
        uint64 mintedAt;
    }
    
    Token[] tokens;
    
    mapping(uint256 => address) public tokenIndexToOwner;
    mapping(address => uint256) ownershipTokenCount;
    mapping(uint256 => address) public tokenIndexToApproved;
    
    event Mint(address owner, uint256 tokenId);
    event Transfer(address from, address to, uint256 tokenId);
    
    
    
    function UniqueToken(string _name, string _symbol) {
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
    }
    
    
    
    function __owns(address claimant, uint256 tokenId) internal view returns (bool) {
        return tokenIndexToOwner[tokenId] == claimant;
    }
    
    
    
    function __approvedFor(address claimant, uint256 tokenId) internal view returns (bool) {
        return tokenIndexToApproved[tokenId] == claimant;
    }
    
    
    
    function __approve(address to, uint256 tokenId) internal {
        tokenIndexToApproved[tokenId] = to;
        Approval(tokenIndexToOwner[tokenId], tokenIndexToApproved[tokenId], tokenId);
    }
    
    
    
    function __transfer(address from, address to, uint256 tokenId) internal {
        ownershipTokenCount[to]++;
        tokenIndexToOwner[tokenId] = to;
        
        if (from != address(0)) {
            ownershipTokenCount[from]--;
            delete tokenIndexToApproved[tokenId];
        }
        
        emit Transfer(from, to, tokenId);
    }
    
    
    
    function __mint(address owner) internal returns (uint256 tokenId) {
        Token memory token = Token({
            mintedBy: owner,
            mintedAt: uint64(now)
        });
        tokenId = tokens.push(token) - 1;
        
        emit Mint(owner, tokenId);
        __transfer(0, owner, tokenId);
        
        return tokenId;
    }
    
    
    
    function supportsInterface(bytes4 interfaceID) external view returns (bool) {
        return ((interfaceID == InterfaceID_ERC165) || (interfaceID == InterfaceID_ERC721));
    }
    
    
    
    function totalSupply() public view returns (uint256) {
        return tokens.length;
    }
    
    
    
    function balanceOf(address owner) public view returns (uint256) {
        return ownershipTokenCount[owner];
    }
    
    
    
    function ownerOf(uint256 tokenId) external view returns (address owner) {
        owner = tokenIndexToOwner[tokenId];
        require(owner != address(0));
    }
    
    
    
    function approve(address to, uint256 tokenId) external {
        require(__owns(msg.sender, tokenId));
        __approve(to, tokenId);
    }
    
    
    
    function transfer(address to, uint256 tokenId) external {
        require(to != address(0));
        require(to != address(this));
        require(__owns(msg.sender, tokenId));
        
        __transfer(msg.sender, to, tokenId);
    }
    
    
    
    function transferFrom(address from, address to, uint256 tokenId) external {
        require(to != address(0));
        require(to != address(this));
        require(__approvedFor(msg.sender, tokenId));
        require(__owns(from, tokenId));
        
        __transfer(from, to, tokenId);
    }
    
    
    
    function tokensOfOwner(address owner) external view returns (uint256[]) {
        uint256 balance = balanceOf(owner);
        
        if (balance == 0) {
            return new uint256[](0);
            
        } else {
            uint256[] memory result = new uint256[](balance);
            uint256 maxTokenId = totalSupply();
            uint256 idx = 0;
            
            uint256 tokenId;
            for (tokenId = 1; tokenId <= maxTokenId; tokenId++) {
                if (tokenIndexToOwner[tokenId] == owner) {
                    result[idx] = tokenId;
                    idx++;
                }
            }
        }
        
        return result;
    }
    
    
    
    function mint(uint numTokens) external returns (uint256) {
        require(numTokens <= 100);
        
        for (uint i = 1; i <= numTokens; i++) {
            __mint(msg.sender);
        }

        return 1;
    }
    
    
    
    function getToken(uint256 tokenId) external view returns (address mintedBy, uint64 mintedAt) {
        Token memory token = tokens[tokenId];
        
        mintedBy = token.mintedBy;
        mintedAt = token.mintedAt;
    }
    
}