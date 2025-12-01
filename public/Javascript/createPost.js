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

const postButton = document.getElementById("post-button");

postButton.addEventListener("click", async () => { 
    const title = document.getElementById("caption-title").value;
    const caption = document.getElementById("caption").value;
    const budget = document.getElementById("budget").value;
    const postLocation = document.getElementById("location").value;
    const weather = document.getElementById("weather").value;    
       
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
        body: JSON.stringify({title, caption, budget, postLocation, weather, image: uploadData.imagePath})
    });

    const postData = await postResponse.json();


    if (postData.success) {
        alert("Post created successfully!");
        
        caption.value = "";
        budget.value = "";
        postLocation.value = "";
        weather.value = "";
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