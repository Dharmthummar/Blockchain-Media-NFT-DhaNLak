// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RoyaltyDistribution {
    struct Content {
        uint256 id;
        string title;
        string ipfsHash;
        address payable creator;
        uint256 price;
        uint256 totalShares;
        mapping(address => uint256) royalties;
    }

    uint256 public contentCounter;
    mapping(uint256 => Content) public contents;
    mapping(uint256 => address payable[]) private shareholders;
    mapping(address => uint256) private balances;
    
    event ContentRegistered(uint256 indexed contentId, string title, address indexed creator);
    event RoyaltyPaid(uint256 indexed contentId, address indexed recipient, uint256 amount);
    event ShareAssigned(uint256 indexed contentId, address indexed recipient, uint256 share);
    event ContentPurchased(uint256 indexed contentId, address indexed buyer, uint256 price);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event PriceUpdated(uint256 indexed contentId, uint256 oldPrice, uint256 newPrice);
    event ShareholderRemoved(uint256 indexed contentId, address indexed recipient);

    // Custom error for 'onlyCreator' modifier
    error NotTheCreator(uint256 contentId);

    modifier onlyCreator(uint256 _contentId) {
        if (msg.sender != contents[_contentId].creator) revert NotTheCreator(_contentId);
        _;
    }

    constructor() payable {}
    receive() external payable {}

    function registerContent(string memory _title, string memory _ipfsHash, uint256 _price) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        require(_price > 0, "Price must be greater than zero");

        contentCounter++;
        Content storage newContent = contents[contentCounter];
        newContent.id = contentCounter;
        newContent.title = _title;
        newContent.ipfsHash = _ipfsHash;
        newContent.creator = payable(msg.sender);
        newContent.price = _price;
        newContent.totalShares = 100;
        newContent.royalties[msg.sender] = 100;
        shareholders[contentCounter].push(payable(msg.sender));

        emit ContentRegistered(contentCounter, _title, msg.sender);
    }

    function assignRoyaltyShare(uint256 _contentId, address payable _recipient, uint256 _share) public onlyCreator(_contentId) {
        require(_recipient != address(0), "Invalid address");
        require(_share > 0 && _share <= contents[_contentId].totalShares, "Invalid share amount");

        Content storage content = contents[_contentId];
        require(content.royalties[_recipient] == 0, "Recipient already has a share");

        content.royalties[_recipient] = _share;
        content.totalShares -= _share;
        shareholders[_contentId].push(_recipient);

        emit ShareAssigned(_contentId, _recipient, _share);
    }

    function distributeRoyalties(uint256 _contentId) public payable {
        require(msg.value > 0, "Must send ETH for royalty");
        Content storage content = contents[_contentId];
        require(content.id > 0, "Content does not exist");

        uint256 totalAmountPaid = 0;
        for (uint i = 0; i < shareholders[_contentId].length; i++) {
            address payable recipient = shareholders[_contentId][i];
            uint256 share = content.royalties[recipient];
            uint256 amount = (msg.value * share) / 100;
            if (amount > 0) {
                balances[recipient] += amount;
                totalAmountPaid += amount;
                emit RoyaltyPaid(_contentId, recipient, amount);
            }
        }

        // Ensure the entire amount is distributed
        require(totalAmountPaid == msg.value, "Royalty distribution mismatch");
    }

    function purchaseContent(uint256 _contentId) public payable {
        Content storage content = contents[_contentId];
        require(content.id > 0, "Content does not exist");
        require(msg.value == content.price, "Incorrect price sent");

        // Refund any excess payment
        if (msg.value > content.price) {
            uint256 excess = msg.value - content.price;
            payable(msg.sender).transfer(excess);
        }

        balances[content.creator] += msg.value;
        emit ContentPurchased(_contentId, msg.sender, content.price);
    }

    function withdrawFunds() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");
        balances[msg.sender] = 0; // Update state before transferring

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        emit FundsWithdrawn(msg.sender, amount);
    }

    function updatePrice(uint256 _contentId, uint256 _newPrice) public onlyCreator(_contentId) {
        require(_newPrice > 0, "Price must be greater than zero");
        uint256 oldPrice = contents[_contentId].price;
        contents[_contentId].price = _newPrice;
        emit PriceUpdated(_contentId, oldPrice, _newPrice);
    }

    function removeShareholder(uint256 _contentId, address _recipient) public onlyCreator(_contentId) {
        Content storage content = contents[_contentId];
        require(content.royalties[_recipient] > 0, "Recipient not a shareholder");

        content.totalShares += content.royalties[_recipient];
        content.royalties[_recipient] = 0;
        emit ShareholderRemoved(_contentId, _recipient);
    }

    function verifyContent(uint256 _contentId) public view returns (string memory, string memory, address, uint256) {
        Content storage content = contents[_contentId];
        require(content.id > 0, "Content does not exist");
        return (content.title, content.ipfsHash, content.creator, content.price);
    }

    function getRoyaltyShare(uint256 _contentId, address _owner) public view returns (uint256) {
        return contents[_contentId].royalties[_owner];
    }

    function getAllShareholders(uint256 _contentId) public view returns (address payable[] memory) {
        return shareholders[_contentId];
    }

    function getTotalSharesRemaining(uint256 _contentId) public view returns (uint256) {
        return contents[_contentId].totalShares;
    }

    // Getter for balance mapping
    function getBalance(address _user) public view returns (uint256) {
        return balances[_user];
    }
}