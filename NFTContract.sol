// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MediaNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Mapping from token ID to content ID
    mapping(uint256 => uint256) private _contentIds;
    
    // Mapping from content ID to token ID
    mapping(uint256 => uint256) private _tokenByContent;
    
    // Mapping from token ID to royalty percentage (in basis points, 100 = 1%)
    mapping(uint256 => uint256) private _royaltyPercentages;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, uint256 indexed contentId, address creator, string tokenURI);
    event RoyaltyPaid(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    
    constructor() ERC721("Media Content NFT", "MCNFT") {}
    
    /**
     * @dev Mints a new NFT representing digital content
     * @param contentId ID of the content in the RoyaltyDistribution contract
     * @param tokenURI URI pointing to the token metadata
     * @param royaltyPercentage Royalty percentage for secondary sales (in basis points)
     * @return tokenId The ID of the newly minted NFT
     */
    function mintNFT(uint256 contentId, string memory tokenURI, uint256 royaltyPercentage) 
        public 
        returns (uint256) 
    {
        require(royaltyPercentage <= 5000, "Royalty percentage cannot exceed 50%");
        require(_tokenByContent[contentId] == 0, "Content already tokenized");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        _contentIds[newTokenId] = contentId;
        _tokenByContent[contentId] = newTokenId;
        _royaltyPercentages[newTokenId] = royaltyPercentage;
        
        emit NFTMinted(newTokenId, contentId, msg.sender, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Returns the royalty information for a token
     * @param tokenId The ID of the token
     * @return receiver Address that should receive royalties
     * @return royaltyAmount The royalty amount to pay
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        external 
        view 
        returns (address receiver, uint256 royaltyAmount) 
    {
        require(_exists(tokenId), "Token does not exist");
        
        uint256 royaltyPercentage = _royaltyPercentages[tokenId];
        uint256 amount = (salePrice * royaltyPercentage) / 10000;
        
        return (ownerOf(tokenId), amount);
    }
    
    /**
     * @dev Pay royalties for a token
     * @param tokenId The ID of the token
     */
    function payRoyalty(uint256 tokenId) external payable {
        require(_exists(tokenId), "Token does not exist");
        require(msg.value > 0, "Payment amount must be greater than 0");
        
        address payable recipient = payable(ownerOf(tokenId));
        recipient.transfer(msg.value);
        
        emit RoyaltyPaid(tokenId, recipient, msg.value);
    }
    
    /**
     * @dev Get the content ID associated with a token
     * @param tokenId The ID of the token
     * @return contentId The associated content ID
     */
    function getContentId(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _contentIds[tokenId];
    }
    
    /**
     * @dev Get the token ID associated with a content
     * @param contentId The ID of the content
     * @return tokenId The associated token ID (0 if not tokenized)
     */
    function getTokenByContent(uint256 contentId) external view returns (uint256) {
        return _tokenByContent[contentId];
    }
    
    /**
     * @dev Get the royalty percentage for a token
     * @param tokenId The ID of the token
     * @return percentage The royalty percentage in basis points
     */
    function getRoyaltyPercentage(uint256 tokenId) external view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _royaltyPercentages[tokenId];
    }
}