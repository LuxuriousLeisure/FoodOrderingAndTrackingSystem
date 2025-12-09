const { ObjectId } = require('mongodb');
const { getDB } = require('./db');
class Driver {
  static async create(driver) {
  
	  
	    const db = getDB();
	    const result = await db.collection('drivers').insertOne({
	      name: driver.name,
	      email: driver.email,
	      password: driver.password,
	      role: driver.role || 'staff',
	      status: 'idle',
	      currentLocation: driver.currentLocation || null,
	      assignedOrderId: null,
	      createdAt: new Date()
	    });
	    return result.insertedId;
    

  }

  static async findByEmail(email) {
    const db = getDB();
    return await db.collection('drivers').findOne({ email });
  }
  
  static async findById(id) {
    const db = getDB();
    return await db.collection('drivers').findOne({ _id: new ObjectId(id) });
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
