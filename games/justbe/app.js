// Get elements from both pages
const feedContainer = document.getElementById('feed');
const searchUserInput = document.getElementById('search-user');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const fileInput = document.getElementById('file-input');
const postDescription = document.getElementById('post-description');
const usernameInput = document.getElementById('username');
const uploadPostButton = document.getElementById('upload-post-button');

// Function to safely retrieve posts from localStorage
function getStoredPosts() {
    try {
        return JSON.parse(localStorage.getItem('posts')) || [];
    } catch (e) {
        console.error("Error loading posts:", e);
        return [];
    }
}

// Function to save posts to localStorage
function savePost(mediaUrl, mediaType, description, username) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    
    // Create a new post object
    const newPost = {
        mediaUrl,
        mediaType,
        description,
        username,
        timestamp: new Date().toISOString(),
        likes: 0, // Start with 0 likes
        reported: false // Start with not reported
    };

    // Add the new post to the array
    posts.push(newPost);

    // Save the updated posts back to local storage
    localStorage.setItem('posts', JSON.stringify(posts));
}


// Function to load posts (for Home Page)
function loadPosts(userFilter = null) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = ''; // Clear current feed

    const filteredPosts = userFilter ? posts.filter(post => post.username.toLowerCase().includes(userFilter.toLowerCase())) : posts;

    filteredPosts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        
        const date = new Date(post.timestamp).toLocaleString();
        
        postElement.innerHTML = `
            ${post.mediaType.startsWith('image') ? `<img src="${post.mediaUrl}" alt="Game or Picture Post">` : ''}
            ${post.mediaType.startsWith('video') ? `<video controls><source src="${post.mediaUrl}" type="${post.mediaType}"></video>` : ''}
            <p><strong>${post.username}</strong> posted on ${date}</p>
            <p>${post.description}</p>
            <p>Likes: <span id="likes-count-${index}">${post.likes}</span> <button onclick="likePost(${index})">Like</button></p>
            <p>Status: ${post.reported ? 'Reported' : 'Not reported'} <button onclick="reportPost(${index})">${post.reported ? 'Unreport' : 'Report'}</button></p>
        `;

        feedContainer.appendChild(postElement);
    });
}

// Function to like a post
function reportPost(postIndex) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];

    // Toggle the reported status of the post
    posts[postIndex].reported = !posts[postIndex].reported;

    // Save the updated posts to local storage
    localStorage.setItem('posts', JSON.stringify(posts));

    // Reload the posts to update the UI
    loadPosts();
}


// Function to report/unreport a post
function reportPost(postIndex) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];

    // Toggle the reported status of the post
    posts[postIndex].reported = !posts[postIndex].reported;

    // Save the updated posts to local storage
    localStorage.setItem('posts', JSON.stringify(posts));

    // Reload the posts to update the UI
    loadPosts();
}


// Function to save a post to localStorage
function savePost(mediaUrl, mediaType, description, username) {
    const posts = getStoredPosts();

    if (posts.length >= 50) posts.shift(); // Keep last 50 posts

    posts.push({
        mediaUrl,
        mediaType,
        description: sanitize(description),
        username: sanitize(username),
        timestamp: new Date().toISOString(),
        likes: 0,  // Initialize likes to 0
        reported: false // Initialize reported flag to false
    });

    savePosts(posts);
}

// Sanitize function to prevent XSS attacks
function sanitize(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Handle post submission (for Post Page)
if (uploadPostButton) {
    uploadPostButton.addEventListener('click', () => {
        const file = fileInput.files[0];
        const description = postDescription.value.trim();
        const username = usernameInput.value.trim();

        if (!file || !description || !username) {
            alert('Please provide a username, file, and description.');
            return;
        }

        // Restrict file types
        if (!file.type.startsWith('image') && !file.type.startsWith('video')) {
            alert('Only image and video files are allowed.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            savePost(event.target.result, file.type, description, username);
            postDescription.value = '';
            usernameInput.value = '';
            fileInput.value = '';

            window.location.href = 'index.html'; // Redirect to Home after posting
        };
        reader.readAsDataURL(file);
    });
}

// Handle search functionality (for Home Page)
if (searchButton) {
    searchButton.addEventListener('click', () => {
        const usernameFilter = searchUserInput.value.trim();
        searchResults.innerHTML = usernameFilter
            ? `<p>Searching for ${sanitize(usernameFilter)}...</p>`
            : '<p>Enter a username to search.</p>';

        loadPosts(usernameFilter);
    });
}

// Load posts on Home Page
if (feedContainer) {
    loadPosts();
}

// Handle search functionality (optional)
if (searchButton) {
    searchButton.addEventListener('click', () => {
        const usernameFilter = searchUserInput.value.trim();
        loadPosts(usernameFilter);
    });
}

