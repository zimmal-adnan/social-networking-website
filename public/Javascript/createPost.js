const postInputFile = document.getElementById("input-file");
const postUploadButton = document.getElementById("upload-post");
const postPreviewImage = document.getElementById("preview-image");
let selectedPostImage = null;

postUploadButton.addEventListener("click", () => {
    postInputFile.click();
});

postInputFile.addEventListener("change", () => {
    const file = postInputFile.files[0];
    if (file) {
        selectedPostImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            postPreviewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});


const celsiusInput = document.getElementById("weather-in-celsius");
const fahrenheitInput = document.getElementById("weather-in-farenheit");

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

const postButton = document.getElementById("post-button");

postButton.addEventListener("click", async () => { 
    const title = document.getElementById("add-caption-title").value;
    const caption = document.getElementById("caption").value;
    const budgetCurrency = document.getElementById("budget-currency").value;
    const budgetMin = document.getElementById("budget-min").value;
    const budgetMax = document.getElementById("budget-max").value;
    const postLocation = document.getElementById("location").value;
    const weatherCelsius = celsiusInput.value;
    const weatherFahrenheit = fahrenheitInput.value;
    const weatherType = document.getElementById("weather-type").value;

    if (!selectedPostImage) {
        alert("Please upload an image for your post!");
        return;
    }

    if (!postLocation) {
        alert("Please add a location for your post!");
        return;
    }

    const formData = new FormData();
    formData.append("postImage", selectedPostImage);

    const uploadResponse = await fetch("/M00988347/uploadPostImage", {
        method: "POST",
        body: formData
    });

    const uploadData = await uploadResponse.json();

    if (!uploadData.success) {
        alert("Image upload failed: " + uploadData.message);
        return;
    }

    const postResponse = await fetch("/M00988347/contents", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, caption, budgetCurrency, budgetMin: parseFloat(budgetMin), budgetMax: parseFloat(budgetMax), postLocation, weatherCelsius: parseFloat(weatherCelsius), weatherFahrenheit: parseFloat(weatherFahrenheit), weatherType, image: uploadData.imagePath})
    });

    const postData = await postResponse.json();

    if (postData.success) {
        alert("Post created successfully!");
        
        document.getElementById("add-caption-title").value = "";
        document.getElementById("caption").value = "";
        document.getElementById("budget-currency").value = "USD";
        document.getElementById("budget-min").value = "";
        document.getElementById("budget-max").value = "";
        document.getElementById("location").value = "";
        celsiusInput.value = "";
        fahrenheitInput.value = "";
        document.getElementById("weather-type").value = "Sunny";
        postPreviewImage.src = "Images/indexImages/Space.jpg";
        selectedPostImage = null;
        postInputFile.value = "";

        showFeed();
        history.pushState({}, "", "/M00988347/feed");
    } 
    else {
        alert("Failed to create post: " + postData.message);
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