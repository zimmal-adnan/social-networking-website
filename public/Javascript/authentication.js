//signup and login password visibility
function eyeIconLogic(eyeShut, eyeOpen, passwordInput) {
    eyeShut.addEventListener("click", () => {
        eyeShut.style.opacity = "0";
        eyeShut.style.pointerEvents = "none";
        eyeOpen.style.opacity = "1";
        eyeOpen.style.pointerEvents = "auto";
        passwordInput.type = "text"; 
    });

    eyeOpen.addEventListener("click", () => {
        eyeOpen.style.opacity = "0";
        eyeOpen.style.pointerEvents = "none";
        eyeShut.style.opacity = "1";
        eyeShut.style.pointerEvents = "auto";
        passwordInput.type = "password";
    });
}

const eyeClosed1 = document.getElementById("eye-slash");
const eyeClosed2 = document.getElementById("eye-slash2");
const eyeOpen1 = document.getElementById("eye-icon");
const eyeOpen2 = document.getElementById("eye-icon2");

const loginEyeClosed = document.getElementById("login-eye-slash");
const loginEyeOpen = document.getElementById("login-eye-icon");

const password = document.getElementById('signup-password');
const loginPassword = document.getElementById('login-password');
const passwordAgain = document.getElementById('signup-confirm-password');

eyeIconLogic(eyeClosed1, eyeOpen1, password);
eyeIconLogic(eyeClosed2, eyeOpen2, passwordAgain);
eyeIconLogic(loginEyeClosed, loginEyeOpen, loginPassword);





//signup and login box hover and click logic
const login = document.getElementById('login');
const signup = document.getElementById('signup');

const cancelLogin = document.getElementById('cancel-login');
const cancelSignup = document.getElementById('cancel-signup');

const signupToLogin = document.getElementById('signup-to-login'); 
const loginToSignup = document.getElementById('login-to-signup');

let lockedSection = null;

function lockSection(section) {
    login.classList.remove('locked');
    signup.classList.remove('locked');
    section.classList.add('locked');
    lockedSection = section;

    cancelLogin.style.visibility = "visible";
    cancelSignup.style.visibility = "visible";
}

function resetSections() {
    login.classList.remove('locked');
    signup.classList.remove('locked');
    lockedSection = null;
    
    cancelLogin.style.visibility = "hidden";
    cancelSignup.style.visibility = "hidden";
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

signupToLogin.addEventListener('click', () => {
    lockSection(login);
});

loginToSignup.addEventListener('click', () => {
    lockSection(signup);
});

cancelLogin.addEventListener('click', (e) => {
    e.stopPropagation();
    resetSections();
});

cancelSignup.addEventListener('click', (e) => {
    e.stopPropagation();
    resetSections();
});



//authentication page background slideshow
const slides = document.querySelectorAll('.background-slideshow .slide');
const locationNames = document.querySelectorAll('.background-slideshow .location-name');
let index = 0;

function showNextSlide() {
    slides[index].classList.remove('active');
    locationNames[index].classList.remove('active');
    
    index = (index + 1) % slides.length;
    
    slides[index].classList.add('active');
    locationNames[index].classList.add('active');
}

slides[0].classList.add('active');
locationNames[0].classList.add('active');

setInterval(showNextSlide, 4000);



//uploading profile picture
const signupInputFile = document.getElementById("signup-input-file");
const signupUploadButton = document.getElementById("signup-upload-button");
const signupProfilePicture = document.getElementById("signup-profile-picture");
let selectedProfilePicture = null;

signupUploadButton.addEventListener("click", () => {
    signupInputFile.click();
});

signupInputFile.addEventListener("change", () => {
    const file = signupInputFile.files[0];
    if (file) {
        selectedProfilePicture = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            signupProfilePicture.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});




//signup functionality
const signupRegistrationButton = document.getElementById("signup-registration-button");
signupRegistrationButton.addEventListener("click", async () => {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const email = document.getElementById("signup-email").value;
    
    const response = await fetch("/M00988347/users", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password, confirmPassword, email})
    });

    const data = await response.json();

    if (data.success == true) {
        if (selectedProfilePicture) {
            const form = new FormData();
            form.append("profilePicture", selectedProfilePicture);
            form.append("username", username);

            const uploadResponse = await fetch("/M00988347/uploadProfilePicture", {
                method: "POST",
                body: form
            });

            const uploadData = await uploadResponse.json();
            
            if (uploadData.success == true) {
                alert('Registration successful with profile picture!');
            } else {
                alert('Registration successful but profile picture upload failed: ' + uploadData.message);
            }
        } else {
            alert('Registration successful!');
        }

        await loadUserProfile(username);
        
        showFeed();
        history.pushState({}, "", "/M00988347/feed");
        selectedProfilePicture = null;
        signupProfilePicture.src = "Images/profile.jpg";
    } else {
        alert(data.message);
    }
});




//login functionality
const loginRegistrationButton = document.getElementById("login-registration-button");
loginRegistrationButton.addEventListener("click", async () => {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("/M00988347/login", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
    });

    const data = await response.json();

    if (data.success == true) {
        alert('Login successful!');
        await loadUserProfile(data.username);
        showFeed();
        history.pushState({}, "", "/M00988347/feed");
    } else {
        alert(data.message);
    }
});

//logout dropdown in navbar
const logOut = document.getElementById('log-out');
const logOutDropDown = document.getElementById('logout-dropdown');
const logOutButton = document.getElementById("logout-dropdown-button");
const profileButton = document.getElementById("profile-dropdown-button");

logOut.style.opacity = '1';

logOutButton.addEventListener("click", async () => {
    const response = await fetch("/M00988347/login", {
        method: "DELETE",
    });

    const data = await response.json();

    if (data.success == true) {
        history.pushState({}, "", "/M00988347/");
        window.location.reload();
    }
});

profileButton.addEventListener("click", () => {
    showUserProfile();
    history.pushState({}, "", "/M00988347/userProfile");
});

const showBox = () => {
    logOutDropDown.style.opacity = '1';
    logOutDropDown.style.visibility = 'visible';
    logOutButton.style.opacity = "1";
    profileButton.style.opacity = "1";
};

const hideBox = () => {
    logOutDropDown.style.opacity = '0';
    logOutDropDown.style.visibility = 'hidden';
    logOutButton.style.opacity = "0";
    profileButton.style.opacity = "0";
};

logOut.addEventListener('mouseenter', showBox);
logOutDropDown.addEventListener('mouseenter', showBox);
logOutButton.addEventListener('mouseenter', showBox);
profileButton.addEventListener('mouseenter', showBox);

logOut.addEventListener('mouseleave', hideBox);
logOutDropDown.addEventListener('mouseleave', hideBox);
logOutButton.addEventListener('mouseleave', hideBox);
profileButton.addEventListener('mouseleave', hideBox);


//load profile picture with username on the navbar
async function loadUserProfile(username) {
    const response = await fetch(`/M00988347/profile/${username}`);
    const data = await response.json();

    if (data.success == true) {
        const navProfilePicture = document.getElementById("nav-profile");
        navProfilePicture.src = data.profilePicture;

        const navUsername = document.getElementById("nav-username");
        navUsername.textContent = data.username;

        const userProfilePicture = document.getElementById("profile-image");
        userProfilePicture.src = data.profilePicture;

        const userProfileUsername = document.getElementById("profile-username");
        userProfileUsername.textContent = data.username;
    }
}

