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
      // stripeSessionId: session.id,
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

  static async findById(orderId) {
    const db = getDB();
    return await db.collection('orders').findOne({ 
      _id: new ObjectId(orderId) // 把订单ID转成MongoDB的ObjectId格式
    });
  }

  static async findAll() {
    const db = getDB();
    return await db.collection('orders').find().sort({ createdAt: -1 }).toArray();
  }

  // 新增：通过Stripe会话ID查询订单
  static async findOne(query) {
    const db = getDB();
    return await db.collection('orders').findOne(query);
  }

  static async updateStatus(orderId, status) {
    const db = getDB();
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status, updatedAt: new Date() } }
    );
  }

  static async updateDriver(orderId, driverId) {
    const db = getDB();
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      // 确保将 driverId 存储为 ObjectId
      { $set: { driverId: new ObjectId(driverId), driverStatus: 'assigned' } } 
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