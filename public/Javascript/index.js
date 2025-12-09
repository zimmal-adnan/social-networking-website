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



function showAlert(message){
    alertBox = document.createElement("div");
    alertBox.className = "top-alert";
    document.body.appendChild(alertBox);

    alertBox.textContent = message;

    alertBox.classList.add("show");

    setTimeout(() => {
        alertBox.classList.remove("show");
        alertBox.classList.add("hide");
        
        setTimeout(() => {
            alertBox.remove();
        }, 500);
    }, 2500);
}
