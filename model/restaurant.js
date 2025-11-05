const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

class Restaurant {
  static async findAll() {
    const db = getDB();
    return await db.collection('restaurants').find().toArray();
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection('restaurants').findOne({ _id: new ObjectId(id) });
  }

  static async getDishes(restaurantId) {
    const db = getDB();
    return await db.collection('dishes').find({ restaurantId: new ObjectId(restaurantId) }).toArray();
  }

  static async addComment(restaurantId, comment) {
    const db = getDB();
    await db.collection('comments').insertOne({
      restaurantId: new ObjectId(restaurantId),
      ...comment,
      createdAt: new Date()
    });
  }

  static async getComments(restaurantId) {
    const db = getDB();
    return await db.collection('comments').find({
      restaurantId: new ObjectId(restaurantId)
    }).sort({ createdAt: -1 }).toArray();
  }
}

module.exports = Restaurant;