import express from "express";
import bodyParser from "body-parser";
import expressSession from "express-session";
import { connectToDatabase } from "./database.js";
import path from "path";
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const uploadsFolder = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, { recursive: true });
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


//registering
app.post("/M00988347/users", async (request, response) => {
    const {username, password, confirmPassword, email, selectedProfilePicture} = request.body;

    const db = await connectToDatabase();
    const users = db.collection("users");

    const existingUser = await users.findOne({username});

    if (existingUser) {
        return response.json({success: false, message: "Username already exists"});
    }
    if (password.length < 4) {
        return response.json({success: false, message: "Password must be at least 4 characters"});
    }
    if (password !== confirmPassword) {
        return response.json({success: false, message: "Passwords do not match"});
    }

    await users.insertOne({username, password, email, profilePicture: "/M00988347/Images/profile.jpg", createdAt: new Date()});

    request.session.user = {username}; 

    response.json({success: true, username, message: "Registration successful"});
});

//logging in 
app.post("/M00988347/login", async (request, response) => {
    const {username, password} = request.body;

    const db = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({username});

    if (!user) {
        return response.json({success: false, message: "Username not found"});
    }
    if (user.password !== password) {
        return response.json({success: false, message: "Incorrect password"});
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
        return response.json({ success: false, message: "No file uploaded" });
    }

    const filePath = "/M00988347/uploads/" + request.file.filename;
    
    const db = await connectToDatabase();
    const users = db.collection("users");
        
    await users.updateOne(
        {username},
        {$set: { profilePicture: filePath }}
    );
    
    response.json({success: true, filePath, message: "Profile picture uploaded"});
})

//get user details
app.get("/M00988347/profile/:username", async (request, response) => {
    const {username} = request.params;

    const db = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({username});
    
    response.json({ 
        success: true, 
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || '/M00988347/Images/profile.jpg'
    });
});


//posting
app.post("/M00988347/contents", async (request, response) => {
    if (!request.session.user) {
        return response.json({success: false, message: "You must be logged in to post content"});
    }

    const {title, caption, budget, postLocation, weather, image} = request.body;

    const username = request.session.user.username;

    if(!image){
        return response.json({success: false, message: "Post must have pictures"});
    }

    if(!postLocation){
        return response.json({success: false, message: "Post must have a location"});
    }

    const db = await connectToDatabase();
    const contents = db.collection("contents");

    await contents.insertOne({
        username,
        title: title || "",
        caption: caption || "", 
        budget: budget || 0, 
        postLocation,
        weather: weather || "",
        image, 
        createdAt: new Date()
    });

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


app.get("/M00988347/contents", async (request, response) => {
    const queryPosts = request.query.q || "";
    
    const db = await connectToDatabase();
    const contents = db.collection("contents");

    const results = await contents.find({
        $or: [
            { title: { $regex: queryPosts, $options: 'i' } },
            { caption: { $regex: queryPosts, $options: 'i' } },
            { postLocation: { $regex: queryPosts, $options: 'i' } }
        ]
    }).sort({ createdAt: -1 }).toArray();

    response.json({success: true, results});
});


//searching for users
app.get("/M00988347/users", async (request, response) => {
    const queryUser = request.query.q || "";

    const db = await connectToDatabase();
    const users = db.collection("users");

    const results = await users.find({username: { $regex: queryUser, $options: 'i' }}).toArray();

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
    const followerUser = request.session.user.username

    const db = await connectToDatabase();
    const follows = db.collection("follows");

    await follows.insertOne({followerUser, followingUser});

    response.json({success: true, message: `You are following ${followingUser}`});
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

    await follows.deleteOne({followerUser, followingUser});

    response.json({success: true, message: `You unfollowed ${followingUser}`});
});


app.use('/M00988347', express.static(path.join(__dirname, 'public')));

app.get('/M00988347/*splat', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(3000, () => {
    console.log("Listening on port 3000");
});