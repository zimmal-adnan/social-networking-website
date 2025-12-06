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

exploreSearch.addEventListener("input", async () => {
    const searchQuery = exploreSearch.value.trim();

    if (searchQuery.length === 0) {
        exploreUsers.innerHTML = "";
        explorePosts.innerHTML = "";
        return;
    }

    const userResponse = await fetch(`/M00988347/users?q=${encodeURIComponent(searchQuery)}`);
    const userData = await userResponse.json();

    const postResponse = await fetch(`/M00988347/contents?q=${encodeURIComponent(searchQuery)}`);
    const postData = await postResponse.json();

    searchResults(userData.userResults, postData.results);
    
});

async function searchResults(users, posts){
    exploreUsers.innerHTML = "";
    explorePosts.innerHTML = "";

    if (users && users.length > 0) {  
        users.forEach(user => {
            const userCard = createUserCard(user);
            exploreUsers.appendChild(userCard);
        });
    }

    if (posts && posts.length > 0) {
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

    if ((!users || users.length === 0) && (!posts || posts.length === 0)) {
        explorePosts.innerHTML = `<h3 class = "no-results">No results found</h3>`;
    }

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