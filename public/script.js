document.addEventListener("DOMContentLoaded", () => {
    const star = document.getElementById("shooting-star");

    function shootingStar() {
        const startTop = Math.random() * 10;
        const startLeft = Math.random() * 250 - 150;
        const duration = Math.random() * 2 + 1;
        const delay = Math.random() * 1000 + 1000;

        star.style.top = `${startTop}%`;
        star.style.left = `${startLeft}vw`;
        star.style.opacity = 1;
        star.style.rotate = "315deg";

        star.style.transition = `transform ${duration}s linear, opacity 0.5s`;
        star.style.transform = "translateX(-80vw)";

        setTimeout(() => {
            star.style.opacity = 0;
        }, duration * 800 * 0.8);

        setTimeout(() => {
            star.style.transition = "none";
            star.style.transform = "translateX(0)";
            star.style.opacity = 0;

            setTimeout(shootingStar, delay);
        }, duration * 1000 + 50);
    }

    setTimeout(shootingStar, 1000);
});



const login = document.getElementById('login');
const signup = document.getElementById('signup');

let lockedSection = null;

function lockSection(section) {
    login.classList.remove('locked');
    signup.classList.remove('locked');
    section.classList.add('locked');
    lockedSection = section;
}

login.addEventListener('click', (e) => {
    if (lockedSection && lockedSection !== login) return;
    
    if (lockedSection !== signup) {
        lockSection(login);
    }
});

signup.addEventListener('click', (e) => {
    if (lockedSection && lockedSection !== signup) return;

    if (lockedSection !== login) {
        lockSection(signup);
    }
});

document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        const linkText = e.target.textContent.trim();
        
        if (linkText === 'LOGIN') {
            lockSection(login);
        } else if (linkText === 'SIGNUP') {
            lockSection(signup);
        }
    }
});


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
const loginButton = document.getElementById("registration-button");

const loginDiv = document.getElementById("login");
const signupDiv = document.getElementById("signup");

const navFeed = document.getElementById("nav-feed");
const navExplore = document.getElementById("nav-explore");
const navFeedExplore = document.getElementById("nav-feed-explore");
const navExploreExplore = document.getElementById("nav-explore-explore");


function hideAllSections() {
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

function showHome() {
    hideAllSections();
    homeSection.style.display = "flex";
}

function showAuthentication() {
    hideAllSections();
    authSection.style.display = "flex";   
}

function showFeed() {
    hideAllSections();
    feedSection.style.display = "block";
    mainAppSection.style.display = "block";
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

function showMessages(){
    hideAllSections();
    messageSection.style.display = "block";
    mainAppSection.style.display = "block";
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

function handleRoute() {
    const path = window.location.pathname;

    if (path.endsWith("/login")) showAuthentication("login");
    else if (path.endsWith("/signup")) showAuthentication("signup");
    else if (path.endsWith("/feed")) showFeed();
    else if (path.endsWith("/explore")) showExplore();
    else if (path.endsWith("/createPost")) showCreatePost();
    else if (path.endsWith("/message")) showMessages();
    else if (path.endsWith("/travelPlanner")) showTravelPlanner();
    else if (path.endsWith("/userProfile")) showUserProfile();
    else if (path.endsWith("/")) showHome();
}

handleRoute();
window.addEventListener("popstate", handleRoute);

toLoginButton.addEventListener("click", () => {
    showAuthentication("login");
    history.pushState({}, "", "/M00988347/login");
});

loginButton.addEventListener("click", () => {
    showFeed();
    history.pushState({}, "", "/M00988347/feed");
});

