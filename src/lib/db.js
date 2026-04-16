import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://tobimislej_db_user:93K8WMjYQfnaKcc1@cluster0.m4m4n1f.mongodb.net/progiv_prototipo?retryWrites=true&w=majority";

const options = {};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDB() {
  const client = await clientPromise;
  return client.db("progiv_prototipo");
}
