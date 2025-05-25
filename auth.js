// User Authentication System

let currentUser = null;
const users = JSON.parse(localStorage.getItem('users')) || [];

// Initialize authentication system
function initAuth() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI(true);
    } else {
        showLoginModal();
    }

    // Add event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
}

// Show login modal
function showLoginModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

// Switch between login and register forms
function switchAuthForm(formType) {
    if (formType === 'login') {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('registerTab').classList.remove('active');
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('loginTab').classList.remove('active');
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('authModal').style.display = 'none';
        updateAuthUI(true);
        showToast('Login successful!', 'success');
    } else {
        showToast('Invalid email or password', 'error');
    }
}

// Handle register form submission
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        walletAddress: null,
        profilePicture: 'https://via.placeholder.com/150',
        bio: '',
        createdContent: [],
        purchasedContent: [],
        nfts: []
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login after registration
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    document.getElementById('authModal').style.display = 'none';
    updateAuthUI(true);
    showToast('Registration successful!', 'success');
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI(false);
    showLoginModal();
    showToast('Logged out successfully', 'info');
}

// Update UI based on authentication status
function updateAuthUI(isLoggedIn) {
    const authSection = document.getElementById('authSection');
    const userProfileButton = document.getElementById('userProfileButton');
    const logoutButton = document.getElementById('logoutButton');
    const mainContent = document.getElementById('mainContent');

    if (isLoggedIn && currentUser) {
        authSection.innerHTML = `<span>Welcome, ${currentUser.name}</span>`;
        userProfileButton.style.display = 'inline-block';
        logoutButton.style.display = 'inline-block';
        mainContent.style.display = 'block';
        
        // Link wallet if available
        if (userAccount && !currentUser.walletAddress) {
            currentUser.walletAddress = userAccount;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('users', JSON.stringify(users.map(u => 
                u.id === currentUser.id ? currentUser : u
            )));
        }
    } else {
        authSection.innerHTML = '<span>Please log in to continue</span>';
        userProfileButton.style.display = 'none';
        logoutButton.style.display = 'none';
        mainContent.style.display = 'none';
    }
}

// Update user profile
function updateUserProfile(profileData) {
    if (!currentUser) return;
    
    Object.assign(currentUser, profileData);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users.map(u => 
        u.id === currentUser.id ? currentUser : u
    )));
    
    showToast('Profile updated successfully', 'success');
}

// Add content to user's created content
function addCreatedContent(contentId, contentData) {
    if (!currentUser) return;
    
    currentUser.createdContent.push({
        id: contentId,
        ...contentData
    });
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users.map(u => 
        u.id === currentUser.id ? currentUser : u
    )));
}

// Add content to user's purchased content
function addPurchasedContent(contentId, contentData) {
    if (!currentUser) return;
    
    currentUser.purchasedContent.push({
        id: contentId,
        ...contentData
    });
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users.map(u => 
        u.id === currentUser.id ? currentUser : u
    )));
}

// Add NFT to user's collection
function addNFT(nftData) {
    if (!currentUser) return;
    
    currentUser.nfts.push(nftData);
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('users', JSON.stringify(users.map(u => 
        u.id === currentUser.id ? currentUser : u
    )));
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}