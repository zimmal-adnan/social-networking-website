import express from "express";
import bodyParser from "body-parser";
import expressSession from "express-session";
import { connectToDatabase } from "./database.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import { ObjectId } from 'mongodb'; 
import Groq from "groq-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY 
});

const openWeatherAPI = "87b98df39ed0ae130db8efdb737e0231";

const uploadsFolder = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, {recursive: true});
}

const storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, uploadsFolder);
    },
    filename: function (request, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage});

const multiUpload = multer({
    storage,
    limits: {fileSize: 5 * 1024 * 1024}, 
    fileFilter: (request, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            cb(null, true);
        } 
        else {
            cb(new Error("Only .png, .jpg and .jpeg allowed!"));
        }
    }
}).array("postImages", 5);

app.use(bodyParser.json());
app.use(express.json());

app.use(expressSession({
    secret: 'cst2120 secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.get("/M00988347/weather/:location", async (request, response) => {
    const {location} = request.params;
    try{
        console.log("Fetching weather for:", location);
        console.log(`URL: https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherAPI}&units=metric`);
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${openWeatherAPI}&units=metric`);
        
        if (!weatherResponse.ok) {
            return response.json({success: false, message: "Location or weather data not found"});
        }

        const data = await weatherResponse.json();
        const weatherData = {
            city: data.name,
            tempC: Math.round(data.main.temp),
            temp: data.main.temp,
            description: data.weather[0].description,
            id: data.weather[0].id,
            icon: data.weather[0].icon
        };

        response.json({success: true, weatherData});
    }
    catch (error) {
        console.error("Weather API error:", error);
        response.json({success: false, message: "Failed to fetch weather data"});
    }
});


app.post("/M00988347/chatbot", async (request, response) => {
    try {
        const {message} = request.body;

        if (!message) return;

        const completion = await groq.chat.completions.create({
            messages: [
                {role: "system", content: "You are a helpful travel assistant. Help users with travel recommendations, tips, and questions about destinations, budgets, and travel planning."},
                {role: "user", content: message}
            ],
            model: 'llama-3.3-70b-versatile', 
            temperature: 0.7,
            max_tokens: 1024,
        });

        const chatbotReply = completion.choices[0].message.content;

        response.json({success: true, reply: chatbotReply});

    } catch (error) {
        console.log(error);
        response.json({success: false, reply: "Sorry, I'm having trouble responding right now. Please try again."});
    }
});

//registering
app.post("/M00988347/users", async (request, response) => {
    const {username, password, confirmPassword, email, dateOfBirth, acceptedTerms, selectedProfilePicture} = request.body;

    const db = await connectToDatabase();
    const users = db.collection("users");

    let errors = {};

    if(!username || username.length < 3){
        errors.username = "Username must be at least 3 characters";
    }
    const existingUser = await users.findOne({username});
    if (existingUser) {
        errors.username = "Username already exists";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        errors.email = "Please enter a correct email address";
    }

    if (!password || password.length < 4) {
        errors.password = "Password must be at least 4 characters";
    }
    if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    const birth = new Date(dateOfBirth);
    const currentDate = new Date();

    let age = currentDate.getFullYear() - birth.getFullYear();
    const monthDifference = currentDate.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birth.getDate())) {
        age--;
    }
    if(age < 13){
        errors.date = "You must be at least 13 years old to sign up";
    }
    if (age > 125) {
        errors.date = "Please enter a valid date of birth";
    }

    if(!acceptedTerms){
        errors.terms = "Please accept the terms & conditions";
    }

    if (Object.keys(errors).length > 0) {
        return response.json({success: false, errors});
    }

    await users.insertOne({username, password, email, dateOfBirth, profilePicture: "/M00988347/Images/profile.jpg", createdAt: new Date()});

    request.session.user = {username}; 

    response.json({success: true, username, message: "Registration successful"});
});

//logging in 
app.post("/M00988347/login", async (request, response) => {
    const {username, password} = request.body;

    const db = await connectToDatabase();
    const users = db.collection("users");

    let errors = {};

    const user = await users.findOne({username});
    if (!user) {
        errors.username = "Username not found";
    }
    else {
        if (user.password !== password) {
            errors.password = "Incorrect password";
        }
    }

    if (Object.keys(errors).length > 0) {
        return response.json({success: false, errors});
    }

    request.session.user = {username: user.username};
    response.json({success: true, username: user.username});
});

//getting login status
app.get("/M00988347/login", async (request, response) => {
    if(request.session.user){
        response.json({loggedIn: true, username: request.session.user.username});
    }
    else{
        response.json({loggedIn: false});
    }
});

//logging out
app.delete("/M00988347/login", async (request, response) => {
    request.session.destroy();
    response.json({success: true, message: "Logged out"});
});



//uploading profile picture
app.post("/M00988347/uploadProfilePicture", upload.single('profilePicture'), async (request, response) => {
    const {username} = request.body;

    if (!request.file) {
        return response.json({success: false, message: "No file uploaded"});
    }

    const filePath = "/M00988347/uploads/" + request.file.filename;
    
    const db = await connectToDatabase();
    const users = db.collection("users");
        
    await users.updateOne({username}, {$set: {profilePicture: filePath}});
    
    response.json({success: true, filePath, message: "Profile picture uploaded"});
})

app.put("/M00988347/profile/update", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to edit your profile"});
    }

    const username = request.session.user.username;
    const {bio} = request.body;

    const db = await connectToDatabase();
    const users = db.collection("users");

    await users.updateOne({username}, {$set: { bio: bio || "" }});

    response.json({success: true, message: "Profile updated successfully"});
})

//get user details
app.get("/M00988347/profile/:username", async (request, response) => {
    const {username} = request.params;

    const db = await connectToDatabase();
    const users = db.collection("users");
    const follows = db.collection("follows");

    const user = await users.findOne({username});

    const followerCount = await follows.countDocuments({followingUser: username});
    const followingCount = await follows.countDocuments({followerUser: username});
    
    response.json({ 
        success: true, 
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || '/M00988347/Images/profile.jpg',
        bio: user.bio || "",
        followerCount,
        followingCount
    });
});


//posting
app.post("/M00988347/contents", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to post content"});
    }

    const {title, caption, budgetCurrency, budgetMin, budgetMax, postCountry, postCity, weatherCelsius, weatherFahrenheit, weatherType, image} = request.body;

    const db = await connectToDatabase();
    const contents = db.collection("contents");

    let errors = {};

    const username = request.session.user.username;

    if(!image){
        errors.image = "Please upload picture(s) for your post";
    }

    if(title && title.length > 35){
        errors.title = "Title cannot exceed 35 characters";
    }

    if(!postCountry){
        errors.location = "Please add a country name";
    }

    if(!postCity){
        errors.location = "Please add a city name";
    }

    if(!budgetMax || !budgetMin){
        errors.budget = "Budget cannot be empty";
    }

    if(budgetMax < budgetMin){
        errors.budget = "Maximum budget cannot be higher than the minimum budget";
    }

    if((weatherCelsius < -200 || weatherCelsius > 200) || (weatherFahrenheit < -500 || weatherFahrenheit > 500)){
        errors.weather = "Please enter a valid temperature";
    }

    if (Object.keys(errors).length > 0) {
        return response.json({success: false, errors});
    }

    const postData = {
        username,
        title: title || "",
        caption: caption || "", 
        budget: {
            currency: budgetCurrency || "USD",
            min: budgetMin || null,
            max: budgetMax || null
        },
        postCountry,
        postCity,
        weather: {
            celsius: weatherCelsius || null,
            fahrenheit: weatherFahrenheit || null,
            type: weatherType || "Sunny"
        },
        images: Array.isArray(image) ? image : [image], 
        image: Array.isArray(image) ? image[0] : image,
        createdAt: new Date()
    };

    await contents.insertOne(postData);

    response.json({success: true, message: "Created Post!"});
});

//uploading post
app.post("/M00988347/uploadPostImage", multiUpload, async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to upload images"});
    }

    const files = request.files;

    if (!files || files.length === 0) {
        return response.json({success: false, message: "No image(s) uploaded"});
    }

    if (files.length > 5) {
        return response.json({success: false, message: "You can only upload up to 5 images at a time"});
    }


    const imagePaths = files.map(file => "/M00988347/uploads/" + file.filename);

    response.json({success: true, imagePaths, message: "Image uploaded successfully"});
});

//get user posts
app.get("/M00988347/users/:username/posts", async (request, response) => {
    const {username} = request.params;

    const db = await connectToDatabase();
    const contents = db.collection("contents");

    const posts = await contents.find({username}).sort({createdAt: -1}).toArray();

    response.json({success: true, posts});
    
});

//searching for posts
app.get("/M00988347/contents", async (request, response) => {
    const queryPosts = request.query.q || "";
    
    const db = await connectToDatabase();
    const contents = db.collection("contents");

    let results;

    if (queryPosts.trim() === "") {
        results = await contents.find({}).sort({createdAt: -1}).toArray();
    } 
    else {
        results = await contents.find({
            $or: [
                {title: {$regex: queryPosts, $options: 'i'}},
                {caption: {$regex: queryPosts, $options: 'i'}},
                {postCountry: {$regex: queryPosts, $options: 'i'}},
                {postCity: {$regex: queryPosts, $options: 'i'}}
            ]
        }).sort({createdAt: -1}).toArray();
    }

    response.json({success: true, results});
});

//posting a comment
app.post("/M00988347/comment", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to comment"});
    }
    const {postID, text} = request.body;

    const username = request.session.user.username;

    const db = await connectToDatabase();
    const users = db.collection("users");
    const comments = db.collection("comments");

    const user = await users.findOne({username});
    const commentID = new ObjectId().toString();

    const commentData = {
        commentID,
        postID, 
        username, 
        profilePicture: user.profilePicture || "/M00988347/Images/profile.jpg",
        text,
        likes: 0,
        likedBy: [],
        createdAt: new Date()
    };

    await comments.insertOne(commentData);

    response.json({success: true, comment: commentData});
})


app.post("/M00988347/comment/like", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in"});
    }

    const {commentID} = request.body;
    const username = request.session.user.username;

    const db = await connectToDatabase();
    const comments = db.collection("comments");

    const comment = await comments.findOne({commentID});
   
    let update;
    if (comment.likedBy.includes(username)) {
        update = {$inc: {likes: -1}, $pull: {likedBy: username}};
    } else {
        update = {$inc: {likes: 1}, $push: {likedBy: username}};
    }

    await comments.updateOne({commentID}, update);

    const updatedComment = await comments.findOne({commentID});

    response.json({success: true, comment: updatedComment});
});




//get comments for a particular post
app.get("/M00988347/comments/:postID", async (request, response) => {
    const {postID} = request.params;

    const db = await connectToDatabase();
    const comments = db.collection("comments");

    const results = await comments.find({postID}).sort({createdAt: -1}).toArray();

    response.json({success: true, comments: results});
});



//searching for users
app.get("/M00988347/users", async (request, response) => {
    const queryUser = request.query.q || "";

    const db = await connectToDatabase();
    const users = db.collection("users");

    const results = await users.find({username: {$regex: queryUser, $options: 'i'}}).toArray();

    const userResults = results.map(user => ({
        username: user.username, 
        email: user.email, 
        profilePicture: user.profilePicture || "/M00988347/Images/profile.jpg"
    }));

    response.json({success: true, userResults});
   
});


//following someone
app.post("/M00988347/follow", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to follow someone"});
    }

    const {followingUser} = request.body;
    const followerUser = request.session.user.username;

    if (followerUser === followingUser) {
        return response.json({success: false, message: "You cannot follow yourself"});
    }

    const db = await connectToDatabase();
    const follows = db.collection("follows");

    const existingFollow = await follows.findOne({followerUser, followingUser});
    
    if (existingFollow) {
        return response.json({success: false, message: "Already following this user"});
    }

    await follows.insertOne({followerUser, followingUser});

    response.json({success: true, message: `You are following ${followingUser}`});
});


//check if a follow for a specific user exists
app.get("/M00988347/follow/:username", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, following: false});
    }

    const followerUser = request.session.user.username;   
    const followingUser = request.params.username;        

    const db = await connectToDatabase();
    const follows = db.collection("follows");

    const existingFollow = await follows.findOne({followerUser, followingUser});
    const following = existingFollow != null;

    response.json({success: true, following});
});


//unfollowing someone
app.delete("/M00988347/follow", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to follow someone"});
    }

    const {followingUser} = request.body;
    const followerUser = request.session.user.username

    const db = await connectToDatabase();
    const follows = db.collection("follows");

    const result = await follows.deleteOne({followerUser, followingUser});

    if (result.deletedCount > 0) {
        response.json({success: true, message: `You unfollowed ${followingUser}`});
    }
});


//get posts from users you follow
app.get("/M00988347/feed", async (request, response) => { 
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to view your feed"});
    }

    const followerUser = request.session.user.username;
    
    const db = await connectToDatabase();
    const follows = db.collection("follows");
    const contents = db.collection("contents");

    const followingList = await follows.find({followerUser}).toArray();
    const followingUsernames = followingList.map(f => f.followingUser);

    const posts = await contents.find({username: {$in: followingUsernames}}).sort({createdAt: -1}).toArray();

    response.json({success: true, posts});
})

app.get("/M00988347/conversations", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to message"});
    }

    const username = request.session.user.username;

    const db = await connectToDatabase();
    const follows = db.collection("follows");
    const users = db.collection("users"); 

    const following = await follows.find({followerUser: username}).toArray();
    const followers = await follows.find({followingUser: username}).toArray();

    const followingUsernames = following.map(f => f.followingUser);
    const followerUsernames = followers.map(f => f.followerUser);

    const mutualFollows = followingUsernames.filter(user => 
        followerUsernames.includes(user)
    );

    const conversations = [];
    for (const otherUser of mutualFollows) {
        const userDetails = await users.findOne({username: otherUser});
        conversations.push({
            username: otherUser,
            profilePicture: userDetails.profilePicture || "/M00988347/Images/profile.jpg"
        });
    }


    response.json({success: true, conversations});
    
})


app.get("/M00988347/messages/:receiverUser", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in"});
    }

    const username = request.session.user.username;
    const {receiverUser} = request.params;

    const db = await connectToDatabase();
    const messages = db.collection("messages");
    const follows = db.collection("follows");
    const users = db.collection("users");

    const senderFollowing = await follows.findOne({followerUser: username, followingUser: receiverUser});
    const receiverFollowing = await follows.findOne({followerUser: receiverUser, followingUser: username});

    if(!senderFollowing || !receiverFollowing){
        return response.json({success: false, message: "You can only message friends"});
    }

    const senderUser = await users.findOne({username});
    const receiverUserData = await users.findOne({username: receiverUser});

    const senderPic = senderUser.profilePicture || "/M00988347/Images/profile.jpg";
    const receiverPic = receiverUserData.profilePicture || "/M00988347/Images/profile.jpg";
    
    const messageList = await messages.find({
        $or: [
            {sender: username, receiver: receiverUser},
            {sender: receiverUser, receiver: username}
        ]
    }).sort({timestamp: 1}).toArray();


    response.json({success: true, messages: messageList, senderPic, receiverPic});
});

app.post("/M00988347/messages", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in"});
    }
    
    const {receiver, content} = request.body;
    const sender = request.session.user.username;

    const db = await connectToDatabase();
    const follows = db.collection("follows");
    const messages = db.collection("messages");
    const users = db.collection("users");

    const senderFollowing = await follows.findOne({followerUser: sender, followingUser: receiver});
    const receiverFollowing = await follows.findOne({followerUser: receiver, followingUser: sender});

    if(!senderFollowing || !receiverFollowing){
        return response.json({success: false, message: "You can only message friends"});
    }

    const senderUser = await users.findOne({username: sender});
    const senderPic = senderUser.profilePicture || "/M00988347/Images/profile.jpg";

    const messageData = {
        sender,
        receiver,
        content,
        timestamp: new Date(),
        senderPic
    }

    await messages.insertOne(messageData);

    response.json({success: true, message: messageData});
});


app.use('/M00988347', express.static(path.join(__dirname, 'public')));

app.get('/M00988347/*splat', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
