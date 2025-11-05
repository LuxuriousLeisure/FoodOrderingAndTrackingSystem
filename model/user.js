const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

class User {
  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('users').findOne({ email });
  }

  static async create(userData) {
    const db = getDB();
    const result = await db.collection('users').insertOne(userData);
    return result.insertedId;
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  }
}

module.exports = User;