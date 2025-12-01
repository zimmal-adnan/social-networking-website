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

function searchResults(users, posts){
    exploreUsers.innerHTML = "";
    explorePosts.innerHTML = "";

    if (users && users.length > 0) {  
        users.forEach(user => {
            const userCard = createUserCard(user);
            exploreUsers.appendChild(userCard);
        });
    }

    if (posts && posts.length > 0) {
        posts.forEach(post => {
            const postCard = createPostCard(post);
            explorePosts.appendChild(postCard);
        });
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

    userCard.addEventListener("click", () => {
        loadUserProfile(user.username, false);
        showUserProfile();
        history.pushState({}, "", `/M00988347/userProfile/${user.username}`);
    });

    return userCard;
}


function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.className = "user-post";
    
    postCard.innerHTML = `
        <div class="explore-post-image">
            <div class="upper-section">
                <div class="upper-left">
                    <img src="Images/profile.jpg" class="post-profile-picture">
                    <h4 class="post-username">${post.username}</h4>
                </div>
                <h5 class="post-time">Posted ${postTimeDifference(post.createdAt)}</h5>
            </div>

            <div class="image-wrapper">
                <img src="${post.image}" class="image">
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
                        <h2 class="post-location">${post.postLocation}</h2>
                    </div>
                    <div class="post-weather-wrapper">
                        <h2 class="post-weather">${post.weather || 'N/A'}</h2>
                        <img src="Images/cloudy.png" class="post-weather-image">
                    </div>
                </div>
                <h2 class="post-budget">Budget: ${post.budget || 'N/A'}</h2>
            </div>
        </div>
    `;

    return postCard;
}

