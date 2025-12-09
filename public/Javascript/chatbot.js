const chatbot = document.getElementById("chatbot");
const chatbotBox = document.getElementById("chatbot-box");
const chatbotClose = document.getElementById("chatbot-close");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotSend = document.getElementById("chatbot-send");
const chatbotMessages = document.getElementById("chatbot-messages");

chatbot.addEventListener("click", () => {
    chatbotBox.classList.add("active");
    chatbot.style.display = "none";
})


chatbotClose.addEventListener("click", () => {
    chatbotBox.classList.remove("active");
    chatbot.style.display = "flex";
})


chatbotInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        sendMessageChatBot();
    }
});

chatbotSend.addEventListener("click", sendMessageChatBot);


function addMessage(content, userMessage = false){
    const messageDiv = document.createElement("div");
    messageDiv.className = `chatbot-message ${userMessage ? "user-message" : "bot-message"}`;

    const profileDiv = document.createElement("div");
    profileDiv.className = "chat-profile";
    profileDiv.innerHTML = userMessage ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";

    const paragraph = document.createElement("p");
    paragraph.textContent = content;
    contentDiv.appendChild(paragraph);

    messageDiv.appendChild(profileDiv);
    messageDiv.appendChild(contentDiv);

    chatbotMessages.appendChild(messageDiv);
    scrollToBottomChatBot();
}

async function sendMessageChatBot(){
    const message = chatbotInput.value;

    if (!message) return;

    addMessage(message, true);
    scrollToBottomChatBot();
    chatbotInput.value = "";

    const response = await fetch("/M00988347/chatbot", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({message})
    });    

    const data = await response.json();

    if (data && data.reply) {
        addMessage(data.reply, false);
    } 
    else {
        addMessage("Sorry, I'm having trouble responding right now. Please try again.");
    }
}

function scrollToBottomChatBot(){
    const chatbot = document.querySelector(".chatbot-messages");
    chatbot.scrollTop = chatbot.scrollHeight;
}