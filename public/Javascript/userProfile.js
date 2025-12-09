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

        const bioText = document.getElementById("bio");
        bioText.textContent = data.bio || "";

        const editProfile = document.getElementById("edit-profile");
        const actionButtons = document.getElementById("action-buttons");

        if (currentUserProfile == true) {
            editProfile.style.display = "flex";
            actionButtons.style.display = "none"; 

            openEditProfile();
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
                openPost(post, username, profilePicture, new Date(post.createdAt));
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
    followButton.addEventListener("click", handleFollowClick); 
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

    return data.following || false;
}


function openEditProfile(){
    const editProfileButton = document.getElementById("edit-profile-button");
    const editProfileOverlay = document.getElementById("edit-profile-overlay");
    const editBioInput = document.getElementById("edit-bio-input");
    const bioText = document.getElementById("bio");
    const closeProfileButton = document.getElementById("close-profile-button");
    const saveProfileButton = document.getElementById("save-profile-button");

    let newProfilePictureFile = null;

    editProfileButton.onclick = () => {
        editBioInput.value = bioText.textContent || "";
        editPicturePreview.src = mainProfileImage.src;
        editProfileOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    closeProfileButton.onclick = () => {
        editProfileOverlay.classList.remove("active");
        document.body.style.overflow = "auto";
        newProfilePictureFile = null;
    };


    const changePicButton = document.getElementById("change-profile-picture-button");
    const editPictureInput = document.getElementById("edit-profile-input-file");
    const editPicturePreview = document.getElementById("edit-profile-preview");
    const mainProfileImage = document.getElementById("profile-image"); 
    const navProfileImage = document.getElementById("nav-profile");  


    changePicButton.onclick = () => {
        editPictureInput.click();
    }

    editPictureInput.onchange = () => {
        const file = editPictureInput.files[0];
        if (file) {
            newProfilePictureFile = file;
            const reader = new FileReader();
            reader.onload = e => editPicturePreview.src = e.target.result;
            reader.readAsDataURL(file);
        }
    };


    saveProfileButton.onclick = async () => {
        const newBio = editBioInput.value;
        const currentUsername = document.getElementById("profile-username").textContent;

        if(newProfilePictureFile){
            const form = new FormData();
            form.append("profilePicture", newProfilePictureFile);
            form.append("username", currentUsername);

            const uploadResponse = await fetch("/M00988347/uploadProfilePicture", {
                method: "POST",
                body: form
            });

            const uploadData = await uploadResponse.json();

            if (uploadData.success) {
                mainProfileImage.src = uploadData.filePath;
                navProfileImage.src = uploadData.filePath;
                editPicturePreview.src = uploadData.filePath;
            }
        }

        const response = await fetch("/M00988347/profile/update", {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({bio: newBio})
        });

        const data = await response.json();

        if (data.success) {
            bioText.textContent = newBio;
            editProfileOverlay.classList.remove("active");
            document.body.style.overflow = "auto";
            newProfilePictureFile = null;
        } 
        else {
            showAlert("Error updating profile");
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const messageButton = document.getElementById("message-button");
    
    if(messageButton){
        messageButton.addEventListener("click", async () => {
            const username = document.getElementById("profile-username").textContent;
            
            const response = await fetch(`/M00988347/messages/${username}`);
            const data = await response.json();

            if (!data.success) {
                showAlert(data.message);
                return;
            }

            showMessages();
            history.pushState({}, "", "/M00988347/message");
            
            setTimeout(() => {
                loadChat(username);
            }, 100);
        });
    }
});