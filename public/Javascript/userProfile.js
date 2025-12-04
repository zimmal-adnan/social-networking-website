async function loadUserProfile(username, currentUserProfile) {
    const response = await fetch(`/M00988347/profile/${username}`);
    const data = await response.json();

    if (data.success == true) {
        if(currentUserProfile){
            const navProfilePicture = document.getElementById("nav-profile");
            navProfilePicture.src = data.profilePicture;

            const navUsername = document.getElementById("nav-username");
            navUsername.textContent = data.username;
        }
        
        const userProfilePicture = document.getElementById("profile-image");
        userProfilePicture.src = data.profilePicture;

        const userProfileUsername = document.getElementById("profile-username");
        userProfileUsername.textContent = data.username;

        const followerNumber = document.getElementById("follower-number");
        const followingNumber = document.getElementById("following-number");
        
        followerNumber.textContent = data.followerCount || 0;
        followingNumber.textContent = data.followingCount || 0;
        
        const editProfile = document.getElementById("edit-profile");
        const actionButtons = document.getElementById("action-buttons");

        if (currentUserProfile == true) {
            editProfile.style.display = "flex";
            actionButtons.style.display = "none";
        } 
        else {
            editProfile.style.display = "none";
            actionButtons.style.display = "flex";
    
            const isFollowing = await checkFollow(username);
            currentlyFollowing = isFollowing;
            updateFollowButton();
        }

        await loadUserPosts(username); 
    }
}

async function loadUserPosts(username){
    const response = await fetch(`/M00988347/users/${username}/posts`);
    const data = await response.json();

    const postsGrid = document.getElementById("posts-grid");
    postsGrid.innerHTML = "";

    let postCount = 0;

    if(data.success && data.posts.length > 0){
        postCount = data.posts.length;

        const profileResponse = await fetch(`/M00988347/profile/${username}`);
        const profileData = await profileResponse.json();
        const profilePicture = profileData.profilePicture || '/M00988347/Images/profile.jpg';

        data.posts.forEach(post => {
            const postItem = document.createElement("div");
            postItem.className = "post-item";

            const timeDifference = postTimeDifference(new Date(post.createdAt));
            
            postItem.innerHTML = `
                <h3 class="timestamp">Posted ${timeDifference}</h3>
                <img src="${post.image}" alt="Post">
                <p class="post-caption-heading">${post.title || "Untitled"}</p>
                <p class="post-caption">${post.caption || ""}</p>
            `;

            postItem.addEventListener("click", () => {
                openPost(post, username, profilePicture);
            });

            postsGrid.appendChild(postItem);
        });
    }
    else{
        postsGrid.innerHTML = "<p class='no-posts'>No posts yet</p>";
        postCount = 0;
    }

    const postNumber = document.getElementById("post-number");
    if (postNumber) {
        postNumber.textContent = postCount;
    }
}

function openPost(postData, username, profilePicture) {
    const postOverlay = document.getElementById("post-overlay");
    const postContent = postOverlay.querySelector(".post-content");
    
    const existingPost = postContent.querySelector(".post");
    if (existingPost) {
        existingPost.remove();
    }

    const postElement = createPost(postData, username, profilePicture, new Date(postData.createdAt));

    const closeButton = postContent.querySelector(".close-post");
    closeButton.after(postElement);

    postOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closePost() {
    const postOverlay = document.getElementById("post-overlay");
    postOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
}


document.addEventListener("DOMContentLoaded", () => {
    const closeButton = document.getElementById("close-post");
    if (closeButton) {
        closeButton.addEventListener("click", closePost);
    }
    
    const postOverlay = document.getElementById("post-overlay");
    if (postOverlay) {
        postOverlay.addEventListener("click", (e) => {
            if (e.target.id === "post-overlay") {
                closePost();
            }
        });
    }
});


function postTimeDifference(postDate){
    const nowTime = new Date();
    const difference = nowTime - postDate;

    const seconds = Math.floor(difference / 1000);
    if (seconds < 60) {
        return `${seconds} seconds ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) { 
        return `${days} days ago`;
    }

    const months = Math.floor(days / 30); 
    if (months < 12) {
        return `${months} months ago`;
    }

    const years = Math.floor(months / 12);
    return `${years} years ago`;
}



const weatherIcons = {
    "Sunny": "Images/sunny.png",
    "Partly Cloudy": "Images/cloudy.png",
    "Cloudy": "Images/cloudy.png",
    "Light Rain": "Images/rainy.png",
    "Heavy Rain": "Images/rainy.png",
    "Thunder": "Images/thunder.png",
    "Hail": "Images/hail.png",
    "Snow": "Images/snowy.png",
    "Foggy": "Images/foggy.png",
    "Windy": "Images/windy.png"
};

function createPost(postData, username, profilePicture, createdAt) {
    const post = document.createElement("div");
    post.className = "post";

    const timeDifference = postTimeDifference(createdAt);

    const weatherType = postData.weather.type || "Sunny";
    const weatherCelsius = postData.weather.celsius;
    const weatherFahrenheit = postData.weather.fahrenheit;
    const weatherIcon = weatherIcons[weatherType] || "Images/cloudy.png";

    let temperatureDisplay = "";
    if (weatherCelsius) {
        temperatureDisplay = `${weatherCelsius}°C`;
    } else if (weatherFahrenheit) {
        temperatureDisplay = `${weatherFahrenheit}°F`;
    }

    const currency = postData.budget.currency || "$";
    const budgetMin = postData.budget.min;
    const budgetMax = postData.budget.max;
    
    let budgetDisplay = "";
    budgetDisplay = `Budget: ${currency}${budgetMin}k - ${currency}${budgetMax}k`;
   

    post.innerHTML = `
        <div class="user-post">
            <div class="post-image">
                <div class="upper-section">
                    <div class="upper-left">
                        <img src="${profilePicture}" class="post-profile-picture">
                        <h4 class="post-username">${username}</h4>
                    </div>
                    <h5 class="post-time">Posted ${timeDifference}</h5>
                </div>
                <div class="image-wrapper">
                    <img src="${postData.image}" class="image">
                    <section class="react">
                        <span class="reaction" title="Already Went!">✅</span>
                        <span class="reaction" title="Love it!">⭐</span>
                        <span class="reaction" title="Going Soon!">✈️</span>
                        <span class="reaction" title="Planning on Going!">📌</span>
                    </section>
                </div>
                <div class="bottom-section">
                    <div class="bottom-top">
                        <div class="post-location-wrapper">
                            <i class="fa-solid fa-location-dot"></i>
                            <h2 class="post-location">${postData.postLocation}</h2>
                        </div>
                        <div class="post-weather-wrapper">
                            <h2 class="post-weather">${weatherType} <span class="post-temperature">${temperatureDisplay}</span></h2>
                            <img src="${weatherIcon}" class="post-weather-image">
                        </div>
                    </div>
                    <h2 class="post-budget">${budgetDisplay}</h2>
                </div>
            </div>
        </div>

        <div class="post-description">
            <div class="triangle"></div>
            <div class="post-caption">
                <div class="post-caption-wrapper">
                    <h2 class="caption-title">${postData.title || "Untitled"}</h2>
                    <h4 class="caption-writer">By ${username}</h4>
                    <h3 class="caption">${postData.caption || "No caption provided"}</h3>
                </div>
            </div>

            <div class="comments">
                <h2 class="comment-title">COMMENTS</h2>
                <div class="user-comments">
                    <!-- Comments will be loaded here -->
                </div>
            </div>

            <div class="add-comment">
                <input class="post-comment" placeholder="Add comment...">
                <div class="add-comment-actions">
                    <button class="add-comment-element"><i class="fa-regular fa-face-smile-beam"></i></button>
                    <button class="add-comment-element"><i class="fa-solid fa-camera"></i></button>
                    <button class="add-comment-button"><i class="fa-solid fa-play"></i></button>
                </div>
            </div>
        </div>
    `;

    return post;
}


const followButton = document.getElementById("follow-button");
let currentlyFollowing = false;

function updateFollowButton(){ 
    if(currentlyFollowing == true){
        followButton.innerHTML = `<i class="fa-solid fa-ban"></i> Unfollow`;
    }
    else{
        followButton.innerHTML = `<i class="fa-solid fa-user-plus"></i> Follow`;
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const followButton = document.getElementById("follow-button");
    if (followButton) {
        followButton.addEventListener("click", handleFollowClick);
    }
});

async function handleFollowClick() {
    const path = window.location.pathname; 
    const usernameFromURL = path.split("/").pop(); 
    const followingUser = usernameFromURL;

    if(currentlyFollowing == true){
        const response = await fetch("/M00988347/follow", {
            method: "DELETE",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({followingUser})
        });
        const data = await response.json();

        if (data.success == true) {
            currentlyFollowing = false;
            updateFollowButton();
            await updateFollowerCounts(followingUser);
        }
    }
    else{
        const response = await fetch("/M00988347/follow", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({followingUser})
        });
        const data = await response.json();

        if (data.success == true) {
            currentlyFollowing = true;
            updateFollowButton();
            await updateFollowerCounts(followingUser);
        }
    }
}

async function updateFollowerCounts(username) {
    const response = await fetch(`/M00988347/profile/${username}`);
    const data = await response.json();
    
    if (data.success) {
        const followerNumber = document.getElementById("follower-number");
        const followingNumber = document.getElementById("following-number");
        
        followerNumber.textContent = data.followerCount || 0;
        followingNumber.textContent = data.followingCount || 0;
    }
}

async function checkFollow(followingUser){
    const response = await fetch(`/M00988347/follow/${followingUser}`);
    const data = await response.json();
    console.log(`Follow status for ${followingUser}:`, data.following);
    return data.following || false;
}