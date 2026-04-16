const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDB() {
  if (cachedDb) return cachedDb;
  
  const client = new MongoClient(uri);
  await client.connect();
  cachedDb = client.db("progiv_prototipo");
  cachedClient = client;
  
  return cachedDb;
}

function getDB() {
  return connectToDB();
}

module.exports = { getDB };
