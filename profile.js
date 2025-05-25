// User Profile Management

// Initialize profile functionality
function initProfile() {
    setupProfileTabs();
    loadUserProfile();
    setupAvatarUpload();
    
    // Set up event listeners
    document.getElementById('editName').addEventListener('input', function() {
        document.getElementById('profileName').textContent = this.value || 'User Name';
    });
    
    document.getElementById('avatarUpload').addEventListener('change', handleAvatarUpload);
}

// Set up secondary tabs in profile section
function setupProfileTabs() {
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

// Load user profile data
function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update profile information
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileWallet').textContent = user.walletAddress ? 
        `Wallet: ${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}` : 
        'Wallet: Not connected';
    
    if (user.profilePicture) {
        document.getElementById('profileAvatar').src = user.profilePicture;
    }
    
    // Set form values
    document.getElementById('editName').value = user.name;
    document.getElementById('editBio').value = user.bio || '';
    
    // Load user content
    loadUserCreatedContent();
    loadUserPurchasedContent();
    loadUserNFTs();
    loadUserActivity();
}

// Handle avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        document.getElementById('profileAvatar').src = imageUrl;
        
        // Save to user profile
        if (currentUser) {
            updateUserProfile({ profilePicture: imageUrl });
        }
    };
    reader.readAsDataURL(file);
}

// Update user profile
function updateProfile() {
    const name = document.getElementById('editName').value;
    const bio = document.getElementById('editBio').value;
    
    if (!currentUser) {
        showToast('Please log in to update your profile', 'error');
        return;
    }
    
    updateUserProfile({
        name,
        bio
    });
    
    showToast('Profile updated successfully!', 'success');
}

// Load user's created content
function loadUserCreatedContent() {
    const user = getCurrentUser();
    if (!user || !user.createdContent || user.createdContent.length === 0) {
        document.getElementById('userCreatedContent').innerHTML = '<p class="empty-state">You haven\'t created any content yet.</p>';
        return;
    }
    
    let html = '';
    user.createdContent.forEach(content => {
        html += `
            <div class="content-card">
                <h3>${content.title}</h3>
                <p>ID: ${content.id}</p>
                <p>Price: ${web3.utils.fromWei(content.price, 'ether')} ETH</p>
                <div class="card-actions">
                    <button onclick="viewContentDetails(${content.id})" class="btn"><i class="fas fa-info-circle"></i> Details</button>
                    <button onclick="prepareUpdatePrice(${content.id}, '${content.price}')" class="btn"><i class="fas fa-edit"></i> Edit</button>
                </div>
            </div>
        `;
    });
    
    document.getElementById('userCreatedContent').innerHTML = html;
}

// Load user's purchased content
function loadUserPurchasedContent() {
    const user = getCurrentUser();
    if (!user || !user.purchasedContent || user.purchasedContent.length === 0) {
        document.getElementById('userPurchasedContent').innerHTML = '<p class="empty-state">You haven\'t purchased any content yet.</p>';
        return;
    }
    
    let html = '';
    user.purchasedContent.forEach(content => {
        html += `
            <div class="content-card">
                <h3>${content.title}</h3>
                <p>ID: ${content.id}</p>
                <p>Creator: ${content.creator.substring(0, 6)}...${content.creator.substring(38)}</p>
                <div class="card-actions">
                    <button onclick="viewContentDetails(${content.id})" class="btn"><i class="fas fa-info-circle"></i> Details</button>
                    <a href="https://ipfs.io/ipfs/${content.ipfsHash}" target="_blank" class="btn"><i class="fas fa-download"></i> Access</a>
                </div>
            </div>
        `;
    });
    
    document.getElementById('userPurchasedContent').innerHTML = html;
}

// Load user's NFT collection
function loadUserNFTs() {
    const user = getCurrentUser();
    if (!user || !user.nfts || user.nfts.length === 0) {
        document.getElementById('userNFTCollection').innerHTML = '<p class="empty-state">You don\'t have any NFTs in your collection yet.</p>';
        return;
    }
    
    let html = '';
    user.nfts.forEach(nft => {
        html += `
            <div class="nft-item">
                <img src="${nft.image || 'https://via.placeholder.com/300?text=NFT'}" alt="${nft.name}" class="nft-image">
                <div class="nft-info">
                    <h4>${nft.name}</h4>
                    <p>${nft.description}</p>
                    <p>Token ID: ${nft.tokenId}</p>
                </div>
            </div>
        `;
    });
    
    document.getElementById('userNFTCollection').innerHTML = html;
}

// Load user activity history
function loadUserActivity() {
    const user = getCurrentUser();
    if (!user) {
        document.getElementById('userActivity').innerHTML = '<p class="empty-state">No activity to display.</p>';
        return;
    }
    
    // For demonstration, we'll create some sample activity
    const activities = [
        {
            type: 'creation',
            title: 'Content Created',
            description: 'You created a new content item',
            time: '2 hours ago',
            icon: 'fa-plus-circle'
        },
        {
            type: 'purchase',
            title: 'Content Purchased',
            description: 'You purchased content from the marketplace',
            time: '1 day ago',
            icon: 'fa-shopping-cart'
        },
        {
            type: 'royalty',
            title: 'Royalty Received',
            description: 'You received 0.05 ETH in royalties',
            time: '3 days ago',
            icon: 'fa-money-bill-wave'
        }
    ];
    
    if (activities.length === 0) {
        document.getElementById('userActivity').innerHTML = '<p class="empty-state">No recent activity to display.</p>';
        return;
    }
    
    let html = '';
    activities.forEach(activity => {
        html += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-details">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
    });
    
    document.getElementById('userActivity').innerHTML = html;
}

// Create NFT from content
async function createNFT(contentId) {
    try {
        if (!isAuthenticated()) {
            showToast('Please log in to create NFTs', 'error');
            return;
        }
        
        showToast('Creating NFT...', 'info');
        
        // Get content details
        const content = await contract.methods.contents(contentId).call();
        
        // For demonstration purposes, we'll simulate NFT creation
        // In a real implementation, this would interact with an NFT contract
        const nftData = {
            name: `NFT: ${content.title}`,
            description: `Tokenized version of ${content.title}`,
            image: `https://ipfs.io/ipfs/${content.ipfsHash}`,
            tokenId: Date.now().toString(),
            contentId: contentId,
            creator: content.creator
        };
        
        // Add NFT to user's collection
        addNFT(nftData);
        
        showToast('NFT created successfully!', 'success');
        loadUserNFTs();
        
        return nftData;
    } catch (error) {
        console.error('Error creating NFT:', error);
        showToast('Error creating NFT. Please try again.', 'error');
        return null;
    }
}

// Show tab by ID
function showTab(tabId) {
    // Remove active class from all buttons and contents
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to specified tab
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}