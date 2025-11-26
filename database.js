import { MongoClient } from "mongodb";

const uri = "mongodb+srv://naziazimmal:5256164.zimmal@cluster0.c0a0n4z.mongodb.net/?appName=Cluster0"
const client = new MongoClient(uri);

let database;

export async function connectToDatabase() {
    if (!database) {
        await client.connect();
        database = client.db("trailblaze");   
        console.log("Connected to MongoDB Atlas");
    }
    return database;
}
