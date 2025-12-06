import express from "express";
import bodyParser from "body-parser";
import expressSession from "express-session";
import { connectToDatabase } from "./database.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const uploadsFolder = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, {recursive: true});
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsFolder);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({storage})

app.use(bodyParser.json());
app.use(express.json());

app.use(expressSession({
    secret: 'cst2120 secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

const wsClients = new Map();


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
        errors.dateOfBirth = "You must be at least 13 years old";
    }
    if (age > 125) {
        errors.dateOfBirth = "Please enter a valid date of birth";
    }

    if(!acceptedTerms){
        errors.terms = "You must accept the terms & conditions";
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
    const username = request.session.user.username;

    if (username && wsClients.has(username)) {
        const ws = wsClients.get(username);
        ws.close();
        wsClients.delete(username);
    }
    
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

    await users.updateOne({ username },{ $set: { bio: bio || "" } });

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

    const {title, caption, budgetCurrency, budgetMin, budgetMax, postLocation, weatherCelsius, weatherFahrenheit, weatherType, image} = request.body;

    const username = request.session.user.username;

    if(!image){
        return response.json({success: false, message: "Post must have pictures"});
    }

    if(!postLocation){
        return response.json({success: false, message: "Post must have a location"});
    }

    const db = await connectToDatabase();
    const contents = db.collection("contents");

    const postData = {
        username,
        title: title || "",
        caption: caption || "", 
        budget: {
            currency: budgetCurrency || "USD",
            min: budgetMin || null,
            max: budgetMax || null
        },
        postLocation,
        weather: {
            celsius: weatherCelsius || null,
            fahrenheit: weatherFahrenheit || null,
            type: weatherType || "Sunny"
        },
        image, 
        createdAt: new Date()
    };

    await contents.insertOne(postData);

    response.json({success: true, message: "Created Post!"});
});

//uploading post
app.post("/M00988347/uploadPostImage", upload.single('postImage'), async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to upload images"});
    }

    if (!request.file) {
        return response.json({success: false, message: "No file uploaded"});
    }

    const imagePath = "/M00988347/uploads/" + request.file.filename;

    response.json({success: true, imagePath, message: "Image uploaded successfully"});
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

    const results = await contents.find({
        $or: [
            {title: {$regex: queryPosts, $options: 'i'}},
            {caption: {$regex: queryPosts, $options: 'i'}},
            {postLocation: {$regex: queryPosts, $options: 'i'} }
        ]
    }).sort({createdAt: -1}).toArray();

    response.json({success: true, results});
});

//posting a comment
app.post("/M00988347/comment", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to follow someone"});
    }

    const {postID, text} = request.body;

    if (!text) {
        return response.json({success: false, message: "Comment is empty"});
    }

    const username = request.session.user.username;

    const db = await connectToDatabase();
    const users = db.collection("users");
    const comments = db.collection("comments");

    const user = await users.findOne({username});

    const commentData = {
        postID, 
        username, 
        profilePicture: user.profilePicture || "/M00988347/Images/profile.jpg",
        text,
        createdAt: new Date()
    };

    await comments.insertOne(commentData);

    response.json({success: true, comment: commentData});
})


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

    const senderFollowing = await follows.findOne({followerUser: username, followingUser: receiverUser});
    const receiverFollowing = await follows.findOne({followerUser: receiverUser, followingUser: username});

    if(!senderFollowing || !receiverFollowing){
        return response.json({success: false, message: "You can only message friends"});
    }
    
    const messageList = await messages.find({
        $or: [
            {sender: username, receiver: receiverUser},
            {sender: receiverUser, receiver: username}
        ]
    }).sort({timestamp: 1}).toArray();


    response.json({success: true, messages: messageList});
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

    const senderFollowing = await follows.findOne({followerUser: sender, followingUser: receiver});
    const receiverFollowing = await follows.findOne({followerUser: receiver, followingUser: sender});

    if(!senderFollowing || !receiverFollowing){
        return response.json({success: false, message: "You can only message friends"});
    }

    const messageData = {
        sender,
        receiver,
        content,
        timestamp: new Date()
    }

    await messages.insertOne(messageData);

    response.json({success: true, message: messageData});
});


app.use('/M00988347', express.static(path.join(__dirname, 'public')));

app.get('/M00988347/*splat', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const server = app.listen(3000, () => {
    console.log("Listening on port 3000");
});

/*const wss = WebSocketServer({server});

wss.on("connection", (ws, request) => {
    console.log("New connection");

    sessionParser(request, {}, () => {
        const session = request.session;

        if (!session || !session.user) {
            ws.close(1008, 'Unauthorized');
            return;
        }

        const username = session.user.username;
        wsClients.set(username, ws);
        console.log(`User ${username} connected via WebSocket`);

        ws.send(JSON.stringify({type: "connected", username}))

        ws.on("message", async (data) => {
            const {receiver, content} = message;
            const sender = username;

            const db = await connectToDatabase();
            const follows = db.collection("follows");
            const messages = db.collection("messages");

            const senderFollowing = await follows.findOne({followerUser: sender, followingUser: receiver});
            const receiverFollowing = await follows.findOne({followerUser: receiver, followingUser: sender});

        })
    })

})*/