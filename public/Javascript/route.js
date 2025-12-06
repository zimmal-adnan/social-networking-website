const wrongSection = document.getElementById("wrong-page-section");
const homeSection = document.getElementById("home-section");
const authSection = document.getElementById("authentication-section");
const mainAppSection = document.getElementById("mainApp-section");
const feedSection = document.getElementById("feed-section");
const exploreSection = document.getElementById("explore-section");
const createPostSection = document.getElementById("create-post-section");
const messageSection = document.getElementById("messages-section");
const travelPlannerSection = document.getElementById("travel-planner-section");
const userProfileSection = document.getElementById("user-profile-section");

const toLoginButton = document.getElementById("to-login");

const loginDiv = document.getElementById("login");
const signupDiv = document.getElementById("signup");

const actionButtons = document.getElementById("action-buttons");
const editProfile = document.getElementById("edit-profile");

function hideAllSections() {
    wrongSection.style.display = "none";
    homeSection.style.display = "none";
    authSection.style.display = "none";
    mainAppSection.style.display = "none";
    feedSection.style.display = "none";
    exploreSection.style.display = "none";
    createPostSection.style.display = "none";
    messageSection.style.display = "none";
    travelPlannerSection.style.display = "none";
    userProfileSection.style.display = "none";
}

function showWrongPage(){
    hideAllSections();
    wrongSection.style.display = "flex";
}

function showHome() {
    hideAllSections();
    homeSection.style.display = "flex";
}

function showAuthentication() {
    hideAllSections();
    authSection.style.display = "flex";   
}

async function showFeed() {
    hideAllSections();
    feedSection.style.display = "block";
    mainAppSection.style.display = "block";
    await loadFeed();
}

function showExplore() {
    hideAllSections();
    exploreSection.style.display = "block";
    mainAppSection.style.display = "block";
}

function showCreatePost() {
    hideAllSections();
    createPostSection.style.display = "block";
    mainAppSection.style.display = "block";
}

async function showMessages(){
    hideAllSections();
    messageSection.style.display = "block";
    mainAppSection.style.display = "block";
    await loadConversations();
}

function showTravelPlanner(){
    hideAllSections();
    travelPlannerSection.style.display = "block";
    mainAppSection.style.display = "block";
}

function showUserProfile(){
    hideAllSections();
    userProfileSection.style.display = "block";
    mainAppSection.style.display = "block";
}

async function handleRoute() {
    const path = window.location.pathname;

    if (path.endsWith("/authentication")) showAuthentication("login");
    else if (path.endsWith("/signup")) showAuthentication("signup");
    else if (path.endsWith("/feed")) showFeed();
    else if (path.endsWith("/explore")) showExplore();
    else if (path.endsWith("/createPost")) showCreatePost();
    else if (path.endsWith("/message")) showMessages();
    else if (path.endsWith("/travelPlanner")) showTravelPlanner();
    else if (path.endsWith("/userProfile")) showUserProfile();
    else if (path.endsWith("/")) showHome();
    else showWrongPage();
}

handleRoute();
window.addEventListener("popstate", handleRoute);

toLoginButton.addEventListener("click", () => {
    showAuthentication("login");
    history.pushState({}, "", "/M00988347/authentication");
});


const navMessages = document.getElementById("nav-messages");
const navFeed = document.getElementById("nav-feed");
const navCreate = document.getElementById("nav-create");
const navExplore = document.getElementById("nav-explore");
const navPlanner = document.getElementById("nav-planner");
const appProfilePicture = document.getElementById("nav-profile");

navMessages.addEventListener("click", () => {
    showMessages();
    history.pushState({}, "", "/M00988347/message");
});

navFeed.addEventListener("click", async () => {
    showFeed();
    history.pushState({}, "", "/M00988347/feed");
});

navCreate.addEventListener("click", () => {
    showCreatePost();
    history.pushState({}, "", "/M00988347/createPost");
});

navExplore.addEventListener("click", () => {
    showExplore();
    history.pushState({}, "", "/M00988347/explore");
});

navPlanner.addEventListener("click", () => {
    showTravelPlanner();
    history.pushState({}, "", "/M00988347/travelPlanner");
});





