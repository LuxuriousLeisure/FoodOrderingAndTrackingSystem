// const { getDB } = require('./db');
// const { ObjectId } = require('mongodb');

// class Driver {
//   static async create(driver) {
//     const db = getDB();
//     const result = await db.collection('drivers').insertOne({
//       ...driver,
//       status: 'idle',
//       currentLocation: driver.currentLocation || null,
//       assignedOrderId: null,
//       createdAt: new Date()
//     });
//     return result.insertedId;
//   }

//   static async findById(id) {
//     const db = getDB();
//     return await db.collection('drivers').findOne({ _id: new ObjectId(id) });
//   }

//   static async updateLocation(driverId, location) {
//     const db = getDB();
//     return await db.collection('drivers').updateOne(
//       { _id: new ObjectId(driverId) },
//       { $set: { currentLocation: location, updatedAt: new Date() } }
//     );
//   }

//   static async assignOrder(driverId, orderId) {
//     const db = getDB();
//     return await db.collection('drivers').updateOne(
//       { _id: new ObjectId(driverId) },
//       { $set: { assignedOrderId: new ObjectId(orderId), status: "to_restaurant" } }
//     );
//   }

//   static async updateStatus(driverId, status) {
//     const db = getDB();
//     return await db.collection('drivers').updateOne(
//       { _id: new ObjectId(driverId) },
//       { $set: { status, updatedAt: new Date() } }
//     );
//   }
// }

// module.exports = Driver;

// model/driver.js 完整修复版
const { getDB } = require('./db');
const { ObjectId } = require('mongodb');

class Driver {
  static async create(driver) {
    const db = getDB();
    const result = await db.collection('drivers').insertOne({
      ...driver,
      status: 'available', // 修正：默认状态改为available（和分配逻辑匹配）
      currentLocation: driver.currentLocation || { lat: 22.29, lng: 114.16 }, // 给默认坐标
      assignedOrderId: null,
      createdAt: new Date()
    });
    return result.insertedId;
  }

  static async findById(id) {
    const db = getDB();
    return await db.collection('drivers').findOne({ _id: new ObjectId(id) });
  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('drivers').findOne({ email });
  }  

  // 新增：补充findOne方法（分配司机时需要）
  static async findOne(query) {
    const db = getDB();
    return await db.collection('drivers').findOne(query);
  }

  static async updateLocation(driverId, location) {
    const db = getDB();
    return await db.collection('drivers').updateOne(
      { _id: new ObjectId(driverId) },
      { $set: { currentLocation: location, updatedAt: new Date() } }
    );
  }

  static async assignOrder(driverId, orderId) {
    const db = getDB();
    return await db.collection('drivers').updateOne(
      { _id: new ObjectId(driverId) },
      { $set: { assignedOrderId: new ObjectId(orderId), status: "to_restaurant" } }
    );
  }

  static async updateStatus(driverId, status) {
    const db = getDB();
    return await db.collection('drivers').updateOne(
      { _id: new ObjectId(driverId) },
      { $set: { status, updatedAt: new Date() } }
    );
  }
}

module.exports = Driver;