const currentUserUsername = document.getElementById("nav-profile");

currentUserUsername.addEventListener("click", async () => {
    const response = await fetch("/M00988347/login");
    const data = await response.json();
    if (data.loggedIn) {
        history.pushState({}, "", "/M00988347/userProfile");
        showUserProfile();
        await loadUserProfile(data.username, true);
    }
});

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
    
        const editProfile = document.getElementById("edit-profile");
        const actionButtons = document.getElementById("action-buttons");

        if (currentUserProfile == true) {
            editProfile.style.display = "flex";
            actionButtons.style.display = "none";
        } 
        else {
            editProfile.style.display = "none";
            actionButtons.style.display = "flex";
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

        data.posts.forEach(post => {
            const postItem = document.createElement("div");
            postItem.className = "post-item";

            const timeDifference = postTimeDifference(new Date(post.createdAt));
            
            postItem.innerHTML = `
                <h3 class = "timestamp" >Posted ${timeDifference}</h3>
                <img src="${post.image}" alt="Post">
                <p class = "post-caption-heading">${post.title || "Untitled"}</p>
                <p class = "post-caption">${post.caption || ""}</p>
            `

            postsGrid.appendChild(postItem);
        });
    }
    else{
        postsGrid.innerHTML = "<p class = 'no-posts'>No posts yet</p>";
        postCount = 0;
    }

    const postNumber = document.getElementById("post-number");
    if (postNumber) {
        postNumber.textContent = postCount;
    }
}

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


