const postInputFile = document.getElementById("input-file");
const postUploadButton = document.getElementById("upload-post");
const postPreviewImage = document.getElementById("preview-image");
let selectedImages = [];
let slideIndex = 1;

postUploadButton.addEventListener("click", () => {
    postInputFile.click();
});

postInputFile.addEventListener("change", (e) => {
    const files = e.target.files;

    if (selectedImages.length + files.length > 5) {
        showAlert("You can only upload 5 images");
        postInputFile.value = ""; 
        return; 
    }

    selectedImages = [...selectedImages, ...files];
    
    const sliderContainer = document.getElementById("post-slider");
    sliderContainer.innerHTML = "";

    const prevButton = document.createElement("a");
    prevButton.className = "prev";
    prevButton.innerHTML = "&#10094;";
    prevButton.onclick = () => plusSlides(-1);
    
    const nextButton = document.createElement("a");
    nextButton.className = "next";
    nextButton.innerHTML = "&#10095;";
    nextButton.onclick = () => plusSlides(1);
    
    sliderContainer.appendChild(prevButton);
    sliderContainer.appendChild(nextButton);

    let loadedCount = 0;

    selectedImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const slideDiv = document.createElement("div");
            slideDiv.className = "post-slide";

            const numberText = document.createElement("div");
            numberText.className = "numbertext";
            numberText.textContent = `${index + 1} / ${selectedImages.length}`;
            
            const img = document.createElement("img");
            img.src = e.target.result;
            
            slideDiv.appendChild(numberText);
            slideDiv.appendChild(img);
            sliderContainer.appendChild(slideDiv);
            
            loadedCount++;
        
            if (loadedCount === selectedImages.length) {
                const dotsContainer = document.querySelector('.dot-container');
                if (!dotsContainer) return;
                
                dotsContainer.innerHTML = "";
                
                for (let i = 0; i < selectedImages.length; i++) {
                    const dot = document.createElement("span");
                    dot.className = "dot";
                    dot.onclick = () => currentSlide(i + 1);
                    dotsContainer.appendChild(dot);
                }
                slideIndex = 1;
                showSlides(slideIndex);
            }
        };
        reader.readAsDataURL(file);
    });
    
    const errorMessage = document.getElementById("error-post-image");
    if (errorMessage) {
        errorMessage.textContent = "";
    } 

    postInputFile.value = "";
});

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}


function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("post-slide");
    let dots = document.getElementsByClassName("dot");

    if (slides.length === 0) return;

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace("dot-active", "");
    }
    slides[slideIndex-1].style.display = "block";
    
    if (dots.length > 0) {
        dots[slideIndex - 1].className += " dot-active";
    }
}


const celsiusInput = document.getElementById("weather-in-celsius");
const fahrenheitInput = document.getElementById("weather-in-fahrenheit");

celsiusInput.addEventListener("input", () => {
    const celsius = parseFloat(celsiusInput.value);
    if (!isNaN(celsius)) {
        const fahrenheit = (celsius * 9/5) + 32;
        fahrenheitInput.value = Math.round(fahrenheit);
    } 
    else {
        fahrenheitInput.value = "";
    }
});

fahrenheitInput.addEventListener("input", () => {
    const fahrenheit = parseFloat(fahrenheitInput.value);
    if (!isNaN(fahrenheit)) {
        const celsius = (fahrenheit - 32) * 5/9;
        celsiusInput.value = Math.round(celsius);
    } 
    else {
        celsiusInput.value = "";
    }
});

function clearPostErrors() {
    document.getElementById("error-post-image").textContent = "";
    document.getElementById("error-post-budget").textContent = "";
    document.getElementById("error-post-location").textContent = "";
    document.getElementById("error-post-weather").textContent = "";
}

document.getElementById("location-country").addEventListener("input", () => {
    document.getElementById("error-post-location").textContent = "";
});

document.getElementById("location-city").addEventListener("input", () => {
    document.getElementById("error-post-location").textContent = "";
});

document.getElementById("budget-min").addEventListener("input", () => {
    document.getElementById("error-post-budget").textContent = "";
});

document.getElementById("budget-max").addEventListener("input", () => {
    document.getElementById("error-post-budget").textContent = "";
});

celsiusInput.addEventListener("input", () => {
    document.getElementById("error-post-weather").textContent = "";
});

fahrenheitInput.addEventListener("input", () => {
    document.getElementById("error-post-weather").textContent = "";
});

const postButton = document.getElementById("post-button");
postButton.addEventListener("click", async () => { 
    clearPostErrors();
    
    const title = document.getElementById("add-caption-title").value;
    const caption = document.getElementById("caption").value;
    const budgetCurrency = document.getElementById("budget-currency").value;
    const budgetMin = document.getElementById("budget-min").value;
    const budgetMax = document.getElementById("budget-max").value;
    
    const postCountry = document.getElementById("location-country").value;
    const postCity = document.getElementById("location-city").value;

    const weatherCelsius = celsiusInput.value;
    const weatherFahrenheit = fahrenheitInput.value;
    const weatherType = document.getElementById("weather-type").value;

    const formData = new FormData();

    if(selectedImages.length != 0){
        for (const img of selectedImages){
            formData.append("postImages", img);
        }
    }

    const uploadResponse = await fetch("/M00988347/uploadPostImage", {
        method: "POST",
        body: formData
    });

    
    const uploadData = await uploadResponse.json();

    if (!uploadData.success) {
        showAlert(uploadData.message);
        return;
    }

    const postResponse = await fetch("/M00988347/contents", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            title, 
            caption, 
            budgetCurrency, 
            budgetMin: parseFloat(budgetMin), 
            budgetMax: parseFloat(budgetMax), 
            postCountry,
            postCity, 
            weatherCelsius: parseFloat(weatherCelsius), 
            weatherFahrenheit: parseFloat(weatherFahrenheit), 
            weatherType, 
            image: uploadData.imagePaths})
    });

    const postData = await postResponse.json();

    if (postData.success) {
        showAlert("Post created successfully!");
        
        document.getElementById("add-caption-title").value = "";
        document.getElementById("caption").value = "";
        document.getElementById("budget-currency").value = "USD";
        document.getElementById("budget-min").value = "";
        document.getElementById("budget-max").value = "";
        document.getElementById("location-country").value = "";
        document.getElementById("location-city").value = "";
        document.getElementById("weather-in-celsius").value = "";
        document.getElementById("weather-in-fahrenheit").value = "";
        document.getElementById("weather-type").value = "Clear Sky";
        
        resetPostPreview();
        postInputFile.value = "";

        wordCount.textContent = "0";

        showFeed();
        history.pushState({}, "", "/M00988347/feedPage");
    } 
    else {
        if (postData.errors) {
            for (const field in postData.errors) {
                const errorMessage = document.getElementById("error-post-" + field);
                if (errorMessage) {
                    errorMessage.textContent = postData.errors[field];
                }
            }
        } 
        else {
            showAlert("Failed to create post: " + postData.message);
        }
    }
});

const captionInput = document.getElementById("caption");        
const wordCount = document.getElementById("word-count");
const captionCounter = document.getElementById("caption-counter");

function updateWordCount() {
    const text = captionInput.value.trim();
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const count = words.length;

    wordCount.textContent = count;
    captionCounter.style.color = count > 100 ? "red" : "";

    if(count > 100){
        const limitedWords = words.slice(0, 100);
        captionInput.value = limitedWords.join(" ");
        wordCount.textContent = 100;
        captionCounter.style.color = "red";
    }
}

captionInput.addEventListener("input", updateWordCount);
updateWordCount();


function resetPostPreview() {
    selectedImages = [];

    const sliderContainer = document.getElementById("post-slider");

    sliderContainer.innerHTML = `
        <img src="Images/EmptyPost.jpg" class="post-slide">
    `;

    const dotsContainer = document.querySelector(".dot-container");
    if (dotsContainer) dotsContainer.innerHTML = "";

    slideIndex = 1;
    showSlides(slideIndex);
}
