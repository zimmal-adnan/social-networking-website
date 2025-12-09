let currentChatUser = null
let messageRefresh = null;
let currentChatInfo = {username: null, profilePicture: null};

async function loadConversations(){
    const response = await fetch("/M00988347/conversations")
    const data = await response.json();
    console.log(data);

    if (data.success) {
        displayConversations(data.conversations);    
    }
}

function displayConversations(conversations){
    const friendsList = document.getElementById("friends-list");
    friendsList.innerHTML = "";

    if(conversations.length === 0){
        friendsList.innerHTML = `
            <div class = "no-conversations">
                <h2>No conversations yet!</h2>
                <p>Follow users back to start messaging</p>
            </div>
        `;
        return;
    }


    conversations.forEach(convo => {
        const friendDiv = document.createElement("div");
        friendDiv.className = "friends";

        friendDiv.innerHTML = `
            <img src="${convo.profilePicture}" alt="Profile">
            <div>
                <h2 class="username">${convo.username}</h2>
            </div>
        `;

        friendDiv.addEventListener("click", () => {
            loadChat(convo.username, convo.profilePicture);
        });

        friendsList.appendChild(friendDiv);
    });
}

async function loadChat(messagingUsername, profilePicture){
    if(messageRefresh){
        clearInterval(messageRefresh);
        messageRefresh = null;
    }

    currentChatInfo.username = messagingUsername;
    currentChatInfo.profilePicture = profilePicture;

    currentChatUser = messagingUsername;

    const messagingUser = document.querySelector(".message-username");
    messagingUser.textContent = messagingUsername;
    const messageProfile = document.querySelector(".message-profile");
    messageProfile.src = profilePicture;

    await loadMessages(messagingUsername);

    messageRefresh = setInterval(() => {
        loadMessages(messagingUsername, true);
    }, 3000);
}

async function loadMessages(messagingUsername, refresh = false){
    const response = await fetch(`/M00988347/messages/${messagingUsername}`);
    const data = await response.json();

    if (data.success) {
        displayMessages(data.messages);
    } 
    else {
        if(!refresh){
            const chatMessages = document.querySelector(".chat-messages");
            chatMessages.innerHTML = `
                <div class="no-messages">
                    <p>${data.message}</p>
                </div>
            `;
        }
    }
    scrollToBottom();
}

function displayMessages(messages){
    const chatMessages = document.querySelector(".chat-messages");
    const currentUsername = document.getElementById("nav-username").textContent;

    chatMessages.innerHTML = "";

    if (messages.length === 0) {
        chatMessages.innerHTML = `
            <div class = "no-messages">
                <h2>No messages yet</h2>
                <p>Start the conversation!</p>
            </div>
        `;
        return;
    }

    messages.forEach(message => {
        const messageDiv = document.createElement("div");

        const sent = message.sender === currentUsername;
        messageDiv.className = sent ? "message sent" : "message received";

        const time = formatTime(new Date(message.timestamp));

        const currentUserProfilePicture = document.getElementById("nav-profile").src;
        const profilePic = sent ? currentUserProfilePicture : currentChatInfo.profilePicture;

        messageDiv.innerHTML = `
            <img src="${profilePic ? profilePic : "/Images/profile.jpg"}" alt="Profile">
            <div class="message-content">
                <div class="message-bubble">
                    ${message.content}
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        
    });
    scrollToBottom();
}

function formatTime(date) {
    function formatted(number){
        return number < 10 ? '0' + number : number;
    }
    const hours = formatted(date.getHours());
    const minutes = formatted(date.getMinutes());
    return `${hours}:${minutes}`;
}


async function sendMessage(){
    const messageInput = document.getElementById("add-message");
    const content = messageInput.value.trim();

    if (!content) return;

    const response = await fetch("/M00988347/messages", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            receiver: currentChatUser,
            content
        })
    });

    const data = await response.json();

    if (data.success) {
        messageInput.value = "";
        await loadMessages(currentChatUser);
        await loadConversations(); 
    } 
    else{
        showAlert(data.message);
    }

    scrollToBottom();
}

document.addEventListener("DOMContentLoaded", () => {
    const sendButton = document.getElementById("send-message-button");
    if(sendButton){
        sendButton.addEventListener("click", sendMessage);
    }

    const messageInput = document.getElementById("add-message");
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    const searchFriends = document.getElementById("search-friends");
    searchFriends.addEventListener("input", async (e) => {
        const query = e.target.value;
        const response = await fetch("/M00988347/conversations");
        const data = await response.json();

        if(data.success){
            const filtered = data.conversations.filter(convo =>
                convo.username.includes(query)
            );
            displayConversations(filtered);
        }
    });
});


window.addEventListener("beforeunload", () => {
    if (messageRefresh) {
        clearInterval(messageRefresh);
    }
});

function scrollToBottom(){
    const chat = document.querySelector(".chat-messages");
    chat.scrollTop = chat.scrollHeight;
}