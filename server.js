import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use('/M00988347', express.static(path.join(__dirname, 'public')));

app.get('/M00988347', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/login', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/signup', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/feed', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/explore', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/createPost', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/message', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/travelPlanner', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/M00988347/userProfile', (request, response) => {
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});



app.use((request, response) => {
    response.status(404).send("<h1>Sorry, Page Not Found</h1>");
});

app.listen(3000, () => {
    console.log("App listening on port 3000");
});
