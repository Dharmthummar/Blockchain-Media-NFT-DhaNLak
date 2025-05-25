const web3 = new Web3(window.ethereum);
let contract;
let userAccount;
let contentCounter = 0;

// Initialize IPFS client
const ipfs = window.IpfsHttpClient.create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

window.onload = async function () {
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Initialize authentication system
    initAuth();
    
    // Setup tab navigation
    setupTabNavigation();
    setupSecondaryTabs();
    
    // Connect to MetaMask
    await connectMetaMask();
    
    // Initialize profile system
    initProfile();
    
    // Initialize theme switcher
    initThemeSwitcher();
    
    const contractAddress = '0x0065D503FF7b49bf177571faed13C500a38fa785'; // Replace with your contract address
    const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			},
			{
				"internalType": "address payable",
				"name": "_recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_share",
				"type": "uint256"
			}
		],
		"name": "assignRoyaltyShare",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "contentId",
				"type": "uint256"
			}
		],
		"name": "NotTheCreator",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "contentId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			}
		],
		"name": "ContentPurchased",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "contentId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "ContentRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			}
		],
		"name": "distributeRoyalties",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundsWithdrawn",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "contentId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "oldPrice",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPrice",
				"type": "uint256"
			}
		],
		"name": "PriceUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			}
		],
		"name": "purchaseContent",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "registerContent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_recipient",
				"type": "address"
			}
		],
		"name": "removeShareholder",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "contentId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RoyaltyPaid",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "contentId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "share",
				"type": "uint256"
			}
		],
		"name": "ShareAssigned",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "contentId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			}
		],
		"name": "ShareholderRemoved",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_newPrice",
				"type": "uint256"
			}
		],
		"name": "updatePrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawFunds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "contentCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "contents",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "address payable",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalShares",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			}
		],
		"name": "getAllShareholders",
		"outputs": [
			{
				"internalType": "address payable[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "getRoyaltyShare",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			}
		],
		"name": "getTotalSharesRemaining",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_contentId",
				"type": "uint256"
			}
		],
		"name": "verifyContent",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Replace with your contract ABI

    contract = new web3.eth.Contract(contractABI, contractAddress);
    
    // Get content counter
    try {
        contentCounter = await contract.methods.contentCounter().call();
        console.log(`Total content count: ${contentCounter}`);
    } catch (error) {
        console.error('Error getting content counter:', error);
    }
    
    // Load marketplace content
    loadMarketplaceContent();
};

// Tab navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Secondary tabs navigation
function setupSecondaryTabs() {
    const tabButtons = document.querySelectorAll('.tab-button-secondary');
    const tabContents = document.querySelectorAll('.tab-content-secondary');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-secondary-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and content
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    const toastContainer = document.getElementById('toastContainer');
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Function to initialize theme switcher
function initThemeSwitcher() {
    const toggleSwitch = document.querySelector('#checkbox');
    const currentTheme = localStorage.getItem('theme');
    
    // Check if a theme is stored in localStorage
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        // Update the toggle switch
        if (currentTheme === 'light') {
            toggleSwitch.checked = true;
        }
    }
    
    // Add event listener to the toggle switch
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            showToast('Light theme activated', 'success');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            showToast('Dark theme activated', 'success');
        }
    });
}

// Connect to MetaMask
async function connectMetaMask() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            web3.eth.defaultAccount = userAccount;
            console.log(`Connected account: ${userAccount}`);
            document.getElementById("walletStatus").innerHTML = `<i class="fas fa-check-circle"></i> Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
            document.getElementById("connectButton").innerHTML = `<i class="fas fa-link"></i> Connected`;
            showToast('Wallet connected successfully!', 'success');
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', function (accounts) {
                userAccount = accounts[0];
                web3.eth.defaultAccount = userAccount;
                document.getElementById("walletStatus").innerHTML = `<i class="fas fa-check-circle"></i> Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
                showToast('Account changed!', 'info');
            });
        } catch (error) {
            console.error('User denied account access', error);
            showToast('Failed to connect wallet. Please try again.', 'error');
        }
    } else {
        console.error('MetaMask not detected');
        document.getElementById("walletStatus").innerText = "MetaMask not detected. Please install it.";
        showToast('MetaMask not detected. Please install it.', 'error');
    }
}

// Upload file to IPFS
async function uploadToIPFS(file) {
    try {
        document.getElementById("contentFile").disabled = true;
        showToast('Uploading to IPFS...', 'info');
        
        const added = await ipfs.add(file);
        const ipfsHash = added.path;
        
        document.getElementById("ipfsHash").value = ipfsHash;
        document.getElementById("contentFile").disabled = false;
        
        showToast('File uploaded to IPFS successfully!', 'success');
        return ipfsHash;
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        document.getElementById("contentFile").disabled = false;
        showToast('Error uploading to IPFS. Please try again.', 'error');
        return null;
    }
}

// Handle file upload
document.getElementById("contentFile").addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        await uploadToIPFS(file);
    }
});

// Register new content
async function registerContent() {
    const title = document.getElementById("title").value;
    let ipfsHash = document.getElementById("ipfsHash").value;
    const price = document.getElementById("price").value;
    
    if (!title || (!ipfsHash && !document.getElementById("contentFile").files[0])) {
        showToast('Please provide a title and either an IPFS hash or upload a file.', 'error');
        return;
    }
    
    // If IPFS hash is not provided but a file is, upload the file
    if (!ipfsHash && document.getElementById("contentFile").files[0]) {
        ipfsHash = await uploadToIPFS(document.getElementById("contentFile").files[0]);
        if (!ipfsHash) return;
    }

    // Convert price to wei (smallest unit of Ether)
    const priceInWei = web3.utils.toWei(price, 'ether');

    try {
        showToast('Registering content...', 'info');
        await contract.methods.registerContent(title, ipfsHash, priceInWei).send({ from: userAccount });
        showToast('Content Registered Successfully!', 'success');
        
        // Clear form
        document.getElementById("title").value = '';
        document.getElementById("ipfsHash").value = '';
        document.getElementById("price").value = '';
        document.getElementById("contentFile").value = '';
        
        // Refresh content list
        loadMyContent();
        loadMarketplaceContent();
    } catch (error) {
        console.error('Error registering content:', error);
        showToast('Error registering content. Please try again.', 'error');
    }
}

// Load user's content
async function loadMyContent() {
    try {
        showToast('Loading your content...', 'info');
        const contentList = document.getElementById("myContentList");
        contentList.innerHTML = '<div class="loader"></div> Loading...';
        
        let html = '<table class="data-table">';
        html += '<tr><th>ID</th><th>Title</th><th>Price (ETH)</th><th>Actions</th></tr>';
        
        let hasContent = false;
        
        for (let i = 1; i <= contentCounter; i++) {
            try {
                const content = await contract.methods.contents(i).call();
                if (content.creator.toLowerCase() === userAccount.toLowerCase()) {
                    hasContent = true;
                    html += `
                        <tr>
                            <td>${content.id}</td>
                            <td>${content.title}</td>
                            <td>${web3.utils.fromWei(content.price, 'ether')}</td>
                            <td>
                                <button onclick="viewContentDetails(${content.id})" class="btn"><i class="fas fa-eye"></i></button>
                                <button onclick="prepareUpdatePrice(${content.id}, '${content.price}')" class="btn"><i class="fas fa-edit"></i></button>
                            </td>
                        </tr>
                    `;
                }
            } catch (error) {
                console.error(`Error fetching content ${i}:`, error);
            }
        }
        
        html += '</table>';
        
        if (!hasContent) {
            contentList.innerHTML = '<p>You have not registered any content yet.</p>';
        } else {
            contentList.innerHTML = html;
        }
        
        showToast('Content loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading content:', error);
        showToast('Error loading content. Please try again.', 'error');
    }
}

// Load marketplace content
async function loadMarketplaceContent() {
    try {
        const marketplaceDiv = document.getElementById("contentMarketplace");
        marketplaceDiv.innerHTML = '<div class="loader"></div> Loading marketplace...';
        
        let html = '<div class="content-grid">';
        
        let hasContent = false;
        
        for (let i = 1; i <= contentCounter; i++) {
            try {
                const content = await contract.methods.contents(i).call();
                hasContent = true;
                
                html += `
                    <div class="content-card">
                        <h3>${content.title}</h3>
                        <p>ID: ${content.id}</p>
                        <p>Price: ${web3.utils.fromWei(content.price, 'ether')} ETH</p>
                        <p>Creator: ${content.creator.substring(0, 6)}...${content.creator.substring(38)}</p>
                        <div class="card-actions">
                            <button onclick="viewContentDetails(${content.id})" class="btn"><i class="fas fa-info-circle"></i> Details</button>
                            <button onclick="preparePurchase(${content.id}, '${content.price}')" class="btn"><i class="fas fa-shopping-cart"></i> Buy</button>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error(`Error fetching content ${i}:`, error);
            }
        }
        
        html += '</div>';
        
        if (!hasContent) {
            marketplaceDiv.innerHTML = '<p>No content available in the marketplace.</p>';
        } else {
            marketplaceDiv.innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading marketplace:', error);
        showToast('Error loading marketplace. Please try again.', 'error');
    }
}

// Prepare purchase form
function preparePurchase(contentId, price) {
    document.getElementById("purchaseContentId").value = contentId;
    
    // Switch to marketplace tab
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector('[data-tab="marketplace-tab"]').classList.add('active');
    document.getElementById('marketplace-tab').classList.add('active');
    
    // Scroll to purchase section
    document.getElementById('purchase-content').scrollIntoView({ behavior: 'smooth' });
    
    showToast(`Ready to purchase content #${contentId}`, 'info');
}

// Prepare update price form
function prepareUpdatePrice(contentId, currentPrice) {
    document.getElementById("updateContentId").value = contentId;
    document.getElementById("newPrice").value = web3.utils.fromWei(currentPrice, 'ether');
    
    // Switch to account tab
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector('[data-tab="account-tab"]').classList.add('active');
    document.getElementById('account-tab').classList.add('active');
    
    // Scroll to update price section
    document.getElementById('update-price').scrollIntoView({ behavior: 'smooth' });
    
    showToast(`Ready to update price for content #${contentId}`, 'info');
}

// View content details
async function viewContentDetails(contentId) {
    document.getElementById("verifyContentId").value = contentId;
    await verifyContent();
    
    // Switch to marketplace tab
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector('[data-tab="marketplace-tab"]').classList.add('active');
    document.getElementById('marketplace-tab').classList.add('active');
    
    // Scroll to content details section
    document.getElementById('content-details').scrollIntoView({ behavior: 'smooth' });
    
    // Add NFT creation button if user is the content creator
    try {
        const content = await contract.methods.contents(contentId).call();
        const contentDetails = document.getElementById('contentDetails');
        
        if (isAuthenticated() && content.creator.toLowerCase() === userAccount.toLowerCase()) {
            // Check if content is already tokenized as NFT
            const nftButton = document.createElement('button');
            nftButton.className = 'btn';
            nftButton.innerHTML = '<i class="fas fa-certificate"></i> Create NFT';
            nftButton.onclick = function() { createNFTFromContent(contentId); };
            
            // Add button after content details
            if (!document.getElementById('nftButton_' + contentId)) {
                nftButton.id = 'nftButton_' + contentId;
                contentDetails.parentNode.insertBefore(nftButton, contentDetails.nextSibling);
            }
        }
    } catch (error) {
        console.error('Error adding NFT button:', error);
    }
}

// Create NFT from content
async function createNFTFromContent(contentId) {
    try {
        if (!isAuthenticated()) {
            showToast('Please log in to create NFTs', 'error');
            return;
        }
        
        showToast('Creating NFT...', 'info');
        
        // Get content details
        const content = await contract.methods.contents(contentId).call();
        
        // Create metadata for NFT
        const metadata = {
            name: content.title,
            description: `NFT representing content ID ${contentId}`,
            image: `https://ipfs.io/ipfs/${content.ipfsHash}`,
            contentId: contentId,
            creator: content.creator
        };
        
        // Upload metadata to IPFS
        const metadataString = JSON.stringify(metadata);
        const metadataBuffer = new Buffer.from(metadataString);
        
        try {
            // For demonstration, we'll simulate IPFS upload
            // In a real implementation, this would upload to IPFS
            const metadataHash = 'QmSimulatedIPFSHash' + Date.now();
            
            // Create NFT in user's collection
            const nftData = await createNFT(contentId);
            
            if (nftData) {
                showToast('NFT created successfully!', 'success');
                
                // Update UI
                const nftButton = document.getElementById('nftButton_' + contentId);
                if (nftButton) {
                    nftButton.innerHTML = '<i class="fas fa-check-circle"></i> NFT Created';
                    nftButton.disabled = true;
                }
                
                // Add to user's created content if not already there
                if (currentUser && !currentUser.createdContent.some(c => c.id === contentId)) {
                    addCreatedContent(contentId, {
                        title: content.title,
                        price: content.price,
                        ipfsHash: content.ipfsHash,
                        creator: content.creator
                    });
                }
            }
        } catch (ipfsError) {
            console.error('Error uploading to IPFS:', ipfsError);
            showToast('Error creating NFT metadata. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error creating NFT:', error);
        showToast('Error creating NFT. Please try again.', 'error');
    }
}
    
    // Search content in marketplace
    function searchContent() {
        const searchTerm = document.getElementById("searchContent").value.toLowerCase();
        const contentCards = document.querySelectorAll('.content-card');
        
        contentCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            if (title.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Assign royalty share
    async function assignRoyaltyShare() {
        const contentId = document.getElementById("contentId").value;
        const recipient = document.getElementById("recipient").value;
        const share = document.getElementById("share").value;
    
        if (!contentId || !recipient || !share) {
            showToast('Please fill in all fields', 'error');
            return;
        }
    
        try {
            showToast('Assigning royalty share...', 'info');
            await contract.methods.assignRoyaltyShare(contentId, recipient, share).send({ from: userAccount });
            showToast('Royalty Share Assigned Successfully!', 'success');
            
            // Clear form
            document.getElementById("share").value = '';
            
            // Update shareholders list
            document.getElementById("royaltyContentId").value = contentId;
            await getAllShareholders();
        } catch (error) {
            console.error('Error assigning royalty share:', error);
            showToast('Error assigning royalty share. Please try again.', 'error');
        }
    }
    
    // Distribute royalties
    async function distributeRoyalties() {
        const contentId = document.getElementById("contentIdDist").value;
        const ethAmount = document.getElementById("ethAmount").value;
    
        if (!contentId || !ethAmount) {
            showToast('Please fill in all fields', 'error');
            return;
        }
    
        try {
            showToast('Distributing royalties...', 'info');
            await contract.methods.distributeRoyalties(contentId).send({ 
                from: userAccount, 
                value: web3.utils.toWei(ethAmount, 'ether') 
            });
            showToast('Royalties Distributed Successfully!', 'success');
            
            // Clear form
            document.getElementById("ethAmount").value = '';
        } catch (error) {
            console.error('Error distributing royalties:', error);
            showToast('Error distributing royalties. Please try again.', 'error');
        }
    }
    
    // Get all shareholders for a content
    async function getAllShareholders() {
        const contentId = document.getElementById("royaltyContentId").value;
        
        if (!contentId) {
            showToast('Please enter a Content ID', 'error');
            return;
        }
    
        try {
            showToast('Fetching shareholders...', 'info');
            const shareholders = await contract.methods.getAllShareholders(contentId).call();
            
            let html = '<table class="data-table">';
            html += '<tr><th>Address</th><th>Share (%)</th></tr>';
            
            for (let i = 0; i < shareholders.length; i++) {
                const address = shareholders[i];
                const share = await contract.methods.getRoyaltyShare(contentId, address).call();
                html += `
                    <tr>
                        <td>${address.substring(0, 6)}...${address.substring(38)}</td>
                        <td>${share}%</td>
                    </tr>
                `;
            }
            
            html += '</table>';
            document.getElementById("allShareholdersDetails").innerHTML = html;
            showToast('Shareholders loaded successfully!', 'success');
        } catch (error) {
            console.error('Error getting shareholders:', error);
            showToast('Error fetching shareholders. Please try again.', 'error');
        }
    }
    
    // Get total shares remaining
    async function getTotalSharesRemaining() {
        const contentId = document.getElementById("royaltyContentId").value;
        
        if (!contentId) {
            showToast('Please enter a Content ID', 'error');
            return;
        }
    
        try {
            const totalShares = await contract.methods.getTotalSharesRemaining(contentId).call();
            document.getElementById("totalSharesDetails").innerText = `Remaining Shares: ${totalShares}%`;
        } catch (error) {
            console.error('Error getting total shares:', error);
            showToast('Error fetching remaining shares. Please try again.', 'error');
        }
    }
    
    // Verify content
    async function verifyContent() {
        const contentId = document.getElementById("verifyContentId").value;
        
        if (!contentId) {
            showToast('Please enter a Content ID', 'error');
            return;
        }
        
        try {
            showToast('Verifying content...', 'info');
            const content = await contract.methods.verifyContent(contentId).call();
            
            let html = `
                <div class="content-details-card">
                    <h3>${content[0]}</h3>
                    <p><strong>IPFS Hash:</strong> ${content[1]}</p>
                    <p><strong>Creator:</strong> ${content[2]}</p>
                    <p><strong>Price:</strong> ${web3.utils.fromWei(content[3], 'ether')} ETH</p>
                    <a href="https://ipfs.io/ipfs/${content[1]}" target="_blank" class="btn">
                        <i class="fas fa-external-link-alt"></i> View on IPFS
                    </a>
                </div>
            `;
            
            document.getElementById("contentDetails").innerHTML = html;
            showToast('Content verified successfully!', 'success');
        } catch (error) {
            console.error('Error verifying content:', error);
            showToast('Error verifying content. Please try again.', 'error');
        }
    }
    
    // Purchase content
    async function purchaseContent() {
        const contentId = document.getElementById("purchaseContentId").value;
        
        if (!contentId) {
            showToast('Please enter a Content ID', 'error');
            return;
        }
        
        try {
            // Get content price
            const content = await contract.methods.contents(contentId).call();
            const price = content.price;
            
            showToast('Processing purchase...', 'info');
            await contract.methods.purchaseContent(contentId).send({ 
                from: userAccount, 
                value: price 
            });
            
            showToast('Content Purchased Successfully!', 'success');
            
            // Clear form
            document.getElementById("purchaseContentId").value = '';
        } catch (error) {
            console.error('Error purchasing content:', error);
            showToast('Error purchasing content. Please try again.', 'error');
        }
    }

    // Get user balance
    async function getBalance() {
        try {
            showToast('Fetching balance...', 'info');
            const balance = await contract.methods.getBalance(userAccount).call();
            document.getElementById("userBalanceDetails").innerHTML = `
                <div class="balance-card">
                    <h3>Your Balance</h3>
                    <p class="balance-amount">${web3.utils.fromWei(balance, 'ether')} ETH</p>
                </div>
            `;
            showToast('Balance fetched successfully!', 'success');
        } catch (error) {
            console.error('Error getting balance:', error);
            showToast('Error retrieving balance. Please try again.', 'error');
        }
    }

    // Withdraw funds
    async function withdrawFunds() {
        try {
            showToast('Processing withdrawal...', 'info');
            await contract.methods.withdrawFunds().send({ from: userAccount });
            showToast('Funds Withdrawn Successfully!', 'success');
            
            // Update balance
            await getBalance();
        } catch (error) {
            console.error('Error withdrawing funds:', error);
            showToast('Error withdrawing funds. Please try again.', 'error');
        }
    }

    // Update price
    async function updatePrice() {
        const contentId = document.getElementById("updateContentId").value;
        const newPrice = document.getElementById("newPrice").value;
    
        if (!contentId || !newPrice) {
            showToast('Please fill in all fields', 'error');
            return;
        }
    
        try {
            showToast('Updating price...', 'info');
            await contract.methods.updatePrice(contentId, web3.utils.toWei(newPrice, 'ether')).send({ from: userAccount });
            showToast('Content Price Updated Successfully!', 'success');
            
            // Clear form
            document.getElementById("updateContentId").value = '';
            document.getElementById("newPrice").value = '';
            
            // Refresh content lists
            loadMyContent();
            loadMarketplaceContent();
        } catch (error) {
            console.error('Error updating price:', error);
            showToast('Error updating price. Please try again.', 'error');
        }
    }

    // Remove shareholder
    async function removeShareholder() {
        const contentId = document.getElementById("removeContentId").value;
        const recipient = document.getElementById("removeRecipient").value;
    
        if (!contentId || !recipient) {
            showToast('Please fill in all fields', 'error');
            return;
        }
    
        try {
            showToast('Removing shareholder...', 'info');
            await contract.methods.removeShareholder(contentId, recipient).send({ from: userAccount });
            showToast('Shareholder Removed Successfully!', 'success');
            
            // Clear form
            document.getElementById("removeContentId").value = '';
            document.getElementById("removeRecipient").value = '';
        } catch (error) {
            console.error('Error removing shareholder:', error);
            showToast('Error removing shareholder. Please try again.', 'error');
        }
    }

    // Add CSS for content cards
    document.head.insertAdjacentHTML('beforeend', `
    <style>
    .content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .content-card {
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .content-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    .content-card h3 {
        color: var(--primary-color);
        margin-bottom: 10px;
    }
    
    .card-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 15px;
    }
    
    .card-actions button {
        padding: 8px 12px;
        font-size: 0.9rem;
    }
    
    .content-details-card {
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        margin-top: 15px;
    }
    
    .balance-card {
        background-color: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        text-align: center;
    }
    
    .balance-amount {
        font-size: 2rem;
        color: var(--primary-color);
        font-weight: 700;
        margin: 10px 0;
    }
    
    .file-upload {
        margin: 10px 0;
    }
    </style>
    `);
