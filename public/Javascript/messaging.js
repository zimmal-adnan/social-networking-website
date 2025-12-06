let currentChatUser = null
let messageRefresh = null;

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
            <div class = "no-conversation">
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
            loadChat(convo.username);
        });

        friendsList.appendChild(friendDiv);
    });
}

async function loadChat(messagingUsername){
    currentChatUser = messagingUsername;

    const messagingUser = document.querySelector(".message-username");

    messagingUser.textContent = messagingUsername;

    await loadMessages(messagingUsername);

    if(messageRefresh){
        clearInterval(messageRefresh);
    }

    messageRefresh= setInterval(() => {
        loadMessages(messagingUsername);
    }, 3000);
}

async function loadMessages(messagingUsername){
    const response = await fetch(`/M00988347/messages/${messagingUsername}`);
    const data = await response.json();

    if (data.success) {
        displayMessages(data.messages);
    } 
    else {
        const chatMessages = document.querySelector(".chat-messages");
        chatMessages.innerHTML = `
            <div class="no-messages">
                <p>${data.message}</p>
            </div>
        `;
    }
}

function displayMessages(messages){
    const chatMessages = document.querySelector(".chat-messages");
    const currentUsername = document.getElementById("nav-username").textContent;

    chatMessages.innerHTML = "";

    if (messages.length === 0) {
        chatMessages.innerHTML = `
            <div class = "no-messages">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }

    messages.forEach(message => {
        const messageDiv = document.createElement("div");

        const messageType = message.sender === currentUsername;
        messageDiv.className = messageType ? "message sent" : "message received";

        const time = formatTime(new Date(message.timestamp));

        messageDiv.innerHTML = `
            <img src="/M00988347/Images/profile.jpg" alt="Profile">
            <div class="message-content">
                <div class="message-bubble">
                    ${message.content}
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
    });
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
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
            content: content
        })
    });

    const data = await response.json();

    if (data.success) {
        messageInput.value = "";
        await loadMessages(currentChatUser);
        await loadConversations(); 
    } 
    else{
        alert(data.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sendButton = document.getElementById("send-message-button");
    if(sendButton){
        sendButton.addEventListener("click", sendMessage);
    }

    const messageInput = document.getElementById("add-message");
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    const searchFriends = document.getElementById("search-friends");
    searchFriends.addEventListener("input", async (e) => {
        const query = e.target.value.toLowerCase();
        const response = await fetch("/M00988347/conversations");
        const data = await response.json();

        if(data.success){
            const filtered = data.conversations.filter(convo =>
                convo.username.toLowerCase().includes(query)
            );
            displayConversations(filtered);
        }
    });
});


window.addEventListener("beforeunload", () => {
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval);
    }
});