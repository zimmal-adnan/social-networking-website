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

