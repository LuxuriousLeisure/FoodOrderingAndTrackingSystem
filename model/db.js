const { MongoClient } = require('mongodb');

// change to your own query string
const uri = 'mongodb+srv://wuyou007991:007991@cluster0.ashcnqc.mongodb.net/?appName=Cluster0';
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('food_ordering');
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('DB connection error:', err);
    throw err;
  }
}

function getDB() {
  return db;
}


module.exports = { connectDB, getDB };
