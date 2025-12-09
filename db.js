import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

username = "zimmal";
password = "5256164.zimmal";

const encodedUsername = encodeURIComponent(username);
const encodedPassword = encodeURIComponent(password);

const connectionURI = "mongodb+srv://naziazimmal:5256164.zimmal@cluster0.c0a0n4z.mongodb.net/?appName=Cluster0" 

console.log(connectionURI)

const client = new MongoClient(connectionURI, {serverApi:
    {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true
    }
});

const database = client.db("trailblaze");
const collection = database.collection("users");

async function find(){
    const query = {};

    const results = await collection.find(query).toArray();

    console.log("These are the documents:\n", results);

    await client.close();
}

async function findSort(){
    const query = {};

    const options = {
        sort: {mark: -1}
    }

    const results = await collection.findSort(query.options).toArray();
    console.log(results);

    await client.close();
}

find();
findSort();