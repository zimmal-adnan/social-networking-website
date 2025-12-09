const closeMapButton = document.getElementById("close-map");
const mapBox = document.getElementById("map-pin");
const exploreBox = document.getElementById("explore");
const mapBoxHeading = document.getElementById("map-pin-h2");

let mapOpen = true;

closeMapButton.addEventListener("click", () => {
    if (mapOpen) {
        mapBox.classList.add("hidden");
        mapBoxHeading.style.opacity = "0";
        closeMapButton.innerHTML = '<i class="fa-solid fa-angle-right"></i>'; 
    } else {
        mapBox.classList.remove("hidden");
        mapBoxHeading.style.opacity = "1";
        closeMapButton.innerHTML = '<i class="fa-solid fa-angle-left"></i>'; 
    }
    mapOpen = !mapOpen;
});

const exploreSearch = document.getElementById("explore-search");
const exploreUsers = document.getElementById("explore-users");
const explorePosts = document.getElementById("explore-posts");
const tabPosts = document.getElementById("tab-posts");
const tabUsers = document.getElementById("tab-users");

let currentTab = "posts";
let allPosts = [];

tabPosts.addEventListener("click", () => {
    currentTab = "posts";
    tabPosts.classList.add("active");
    tabUsers.classList.remove("active");
    exploreUsers.style.display = "none";
    explorePosts.style.display = "grid";
    exploreSearch.placeholder = "Search posts...";
    exploreSearch.value = "";
    
    displayPosts(allPosts);
});

tabUsers.addEventListener("click", () => {
    currentTab = "users";
    tabUsers.classList.add("active");
    tabPosts.classList.remove("active");
    explorePosts.style.display = "none";
    exploreUsers.style.display = "block";
    exploreSearch.placeholder = "Search users...";
    exploreSearch.value = "";
    exploreUsers.innerHTML = "";
});

async function loadExplorePosts() {
    const response = await fetch('/M00988347/contents');
    const data = await response.json();
    allPosts = data.results || [];
    displayPosts(allPosts);
}


async function displayPosts(posts) {
    explorePosts.innerHTML = "";

    if (posts.length === 0) {
        explorePosts.innerHTML = '<h3 class="no-results">No posts found</h3>';
        return;
    }

    for (const post of posts) {
        const response = await fetch(`/M00988347/profile/${post.username}`);
        const data = await response.json();
        const profilePicture = data.profilePicture || "/M00988347/Images/profile.jpg";

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
            const createdAt = new Date(post.createdAt);
            openPost(post, post.username, profilePicture, createdAt);
        });

        explorePosts.appendChild(postItem);
    }
}


exploreSearch.addEventListener("input", async () => {
    const searchQuery = exploreSearch.value.trim();

    if (currentTab === "posts") {
        if (searchQuery.length === 0) {
            displayPosts(allPosts);
        } 
        else {
            const response = await fetch(`/M00988347/contents?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            displayPosts(data.results);
        }
    } 
    else if (currentTab === "users") {
        if (searchQuery.length === 0) {
            exploreUsers.innerHTML = "";
        } else {
            const response = await fetch(`/M00988347/users?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            displayUsers(data.userResults);
        }
    }
});


function displayUsers(users) {
    exploreUsers.innerHTML = "";

    if (!users || users.length === 0) {
        exploreUsers.innerHTML = '<h3 class="no-results">No users found</h3>';
        return;
    }

    users.forEach(user => {
        const userCard = createUserCard(user);
        exploreUsers.appendChild(userCard);
    });
}

function createUserCard(user) {
    const userCard = document.createElement("div");
    userCard.className = "user-usernames";

    userCard.innerHTML = `
        <img src="${user.profilePicture}" class="explore-profile">
        <h3 class="explore-username">${user.username}</h3>
    `;

    userCard.addEventListener("click", async () => {
        const response = await fetch("/M00988347/login");
        const data = await response.json();
        
        if (data.loggedIn) {
            const isCurrentUser = user.username === data.username;
            
            if (isCurrentUser) {
                history.pushState({}, "", "/M00988347/userProfile");
                await loadUserProfile(user.username, true);
            } else {
                history.pushState({}, "", `/M00988347/userProfile/${user.username}`);
                await loadUserProfile(user.username, false);
            }
            
            showUserProfile();
        }
    });
    return userCard;
}

async function createExplorePost(postData){
    const username = postData.username;
    const response = await fetch(`/M00988347/profile/${username}`);
    const data = await response.json();
    const profilePicture = data.profilePicture || "/M00988347/Images/profile.jpg";

    const createdAt = new Date(postData.createdAt);

    return createPost(postData, username, profilePicture, createdAt);
}