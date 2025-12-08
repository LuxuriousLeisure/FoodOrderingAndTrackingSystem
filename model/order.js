const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

class Order {
  static async create(orderData) {
    const db = getDB();
    const result = await db.collection('orders').insertOne({
      ...orderData,
      status: 'pending',
      driverId: null,
      driverStatus: 'waiting',
      userLocation: orderData.userLocation,
      restaurantLocation: orderData.restaurantLocation,
      createdAt: new Date()
    });
    return result.insertedId;
  }

  static async findByUser(userId) {
    const db = getDB();
    return await db.collection('orders').find({
      userId: new ObjectId(userId)
    }).sort({ createdAt: -1 }).toArray();
  }

  static async findAll() {
    const db = getDB();
    return await db.collection('orders').find().sort({ createdAt: -1 }).toArray();
  }

  static async updateStatus(orderId, status) {
    const db = getDB();
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status, updatedAt: new Date() } }
    );
  }

  static async updateDriverLocation(orderId, driverLocation){
    const db = getDB();
    await db.collection('orders').updateOne(
      {_id: new ObjectId(orderId)},
      {$set: {driverLocation, updatedAt: new Date()}}
    );
  }

}

module.exports = Order;