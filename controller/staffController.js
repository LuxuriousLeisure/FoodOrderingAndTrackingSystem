const Order = require('../model/order');
const Driver = require('../model/driver');

// 员工控制台
// exports.getStaffConsole = async (req, res) => {
//   if (!req.session.user || req.session.user.role !== 'staff') {
//     return res.redirect('/login?as=staff');
//   }

//   try {
//     const orders = await Order.findAll();
//     res.render('staff', {
//       user: req.session.user,
//       orders
//     });
//   } catch (err) {
//     res.status(500).send('Error loading staff console');
//   }
// };
exports.getStaffConsole = async (req, res) => {
  if(!req.session.staff || req.session.staff.role !== 'staff'){
    console.log("i knew it")
    return res.redirect('/login?as=staff');
  }

  try {
    const orders = await Order.findAll();
    res.render('staff', {
      staff: req.session.staff,
      orders
    });
  } catch (err) {
    res.status(500).send('Error loading staff console');
  }
};

// 更新订单状态
// exports.updateOrderStatus = async (req, res) => {
//   if (!req.session.user || req.session.user.role !== 'staff') {
//     return res.redirect('/login?as=staff');
//   }

//   try {
//     await Order.updateStatus(req.params.id, req.body.status);
//     res.redirect('/staff');
//   } catch (err) {
//     res.status(500).send('Error updating order');
//   }
// };
exports.updateOrderStatus = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'staff') {
    return res.redirect('/login?as=staff');
  }

  try {
    const orderId = req.params.id;
    const newStatus = req.body.status;
    
    // 1. 更新订单状态
    await Order.updateStatus(orderId, newStatus);
    
    // 2. ⭐ 核心分配逻辑：当状态变为 preparing 时触发分配司机
    if (newStatus === 'pending') {
        // 查找一个空闲的司机 (status: 'available')
        const driver = await Driver.findOne({ status: 'available' }); 
        
        if (driver) {
            // 分配订单给司机，并更新司机状态为 to_restaurant
            await Driver.assignOrder(driver._id, orderId);
            
            // 更新订单中的 driverId 字段
            await Order.updateDriver(orderId, driver._id);
        }
    }

    res.redirect('/staff');
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).send('Error updating order');
  }
};
