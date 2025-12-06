async function loadFeed(){
    const response = await fetch("/M00988347/feed");
    const data = await response.json();

    const feedPosts = document.getElementById("feed-posts");
    feedPosts.innerHTML = "";

    if (data.success && data.posts && data.posts.length > 0) {
        for (const post of data.posts) {
            const userResponse = await fetch(`/M00988347/profile/${post.username}`);
            const userData = await userResponse.json();
            const profilePicture = userData.profilePicture || '/M00988347/Images/profile.jpg';

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
                openPost(post, post.username, profilePicture, new Date(post.createdAt));
            });

            feedPosts.appendChild(postItem);
        }
    }


    else{
        feedPosts.innerHTML = `
            <div class="no-feed-posts">
                <h2>No posts in your feed yet</h2>
                <p>Follow some users to see their posts here</p>
            </div>
        `;
    }
}



function openPost(postData, username, profilePicture, createdAt) {
    const postOverlay = document.getElementById("post-overlay");
    const postContent = postOverlay.querySelector(".post-content");
    
    const existingPost = postContent.querySelector(".post");
    if (existingPost) {
        existingPost.remove();
    }

    const postElement = createPost(postData, username, profilePicture, createdAt);

    const closeButton = postContent.querySelector(".close-post");
    closeButton.after(postElement);

    postOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    loadComments(postData._id);

    const commentInput = postElement.querySelector("#post-comment");
    const submitCommentButton = postElement.querySelector("#add-comment-button");

    submitCommentButton.onclick = null;

    submitCommentButton.onclick = async () => {
        const text = commentInput.value.trim();
        
        if (!text) {
            alert("Please enter a comment");
            return;
        }
        
        const response = await fetch("/M00988347/comment", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({postID: postData._id, text})
        });
        const data = await response.json();

        if (data.success) {
            const commentsSection = postElement.querySelector(".user-comments");
            const newComment = createComment(data.comment);
            commentsSection.prepend(newComment);
            commentInput.value = "";
        } else {
            alert(data.message || "Failed to post comment");
        }
    };
}

function closePost() {
    const postOverlay = document.getElementById("post-overlay");
    postOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
}


async function loadComments(postID) {
    const response = await fetch(`/M00988347/comments/${postID}`);
    const data = await response.json();

    const commentsSection = document.querySelector("#post-overlay .user-comments");

    commentsSection.innerHTML = ""; 

    if (data.success && data.comments.length > 0) {
        commentsSection.innerHTML = "";
        data.comments.forEach(comment => {
            const commentBox = createComment(comment);
            commentsSection.appendChild(commentBox);
        });
    } else {
        commentsSection.innerHTML = "<p class='no-comments' style='text-align: center; color: #888; padding: 2rem;'>No comments yet. Be the first!</p>";
    }
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
    "Sunny": "☀️",
    "Partly Cloudy": "⛅",
    "Cloudy": "☁️",
    "Light Rain": "🌦️",
    "Heavy Rain": "🌧️",
    "Thunder": "⛈️",
    "Hail": "🌨️",
    "Snow": "❄️",
    "Foggy": "🌫️",
    "Windy": "💨"
};


function createComment(comment) {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment-wrapper";

    const date = new Date(comment.createdAt);
    const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")} ${date.toLocaleDateString()}`;

    commentDiv.innerHTML = `
        <div class="comment-user-description">
            <img src="${comment.profilePicture}">
            <div class="comment-user-text">
                <h3 class="comment-username">${comment.username}</h3>
                <h4 class="comment-time">${formattedTime}</h4>
            </div>
            <i class="fa-solid fa-question"></i>
        </div>
        <h2 class="comment">${comment.text}</h2>
        <div class="comment-interaction">
            <i class="fa-regular fa-heart"></i>
            <i class="fa-regular fa-comment"></i>
            <i class="fa-regular fa-bookmark"></i>
        </div>
    `;

    return commentDiv;
}


function createPost(postData, username, profilePicture, createdAt) {
    const post = document.createElement("div");
    post.className = "post";

    const timeDifference = postTimeDifference(createdAt);

    const weatherType = postData.weather.type || "Sunny";
    const weatherCelsius = postData.weather.celsius;
    const weatherFahrenheit = postData.weather.fahrenheit;
    const weatherIcon = weatherIcons[weatherType] || "Images/cloudy.png";

    let temperatureDisplay = "";
    temperatureDisplay = `${weatherCelsius}°C / ${weatherFahrenheit}°F`;


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
                            <p class = "post-weather-image">${weatherIcon}</p>
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
                <div class="user-comments" id = "user-comments">
                    
                </div>
            </div>

            <div class="add-comment">
                <input class="post-comment" id = "post-comment" placeholder="Add comment...">
                <div class="add-comment-actions">
                    <button class="add-comment-element"><i class="fa-regular fa-face-smile-beam"></i></button>
                    <button class="add-comment-element"><i class="fa-solid fa-camera"></i></button>
                    <button class="add-comment-button" id = "add-comment-button"><i class="fa-solid fa-play"></i></button>
                </div>
            </div>
        </div>
    `;

    return post;
}

