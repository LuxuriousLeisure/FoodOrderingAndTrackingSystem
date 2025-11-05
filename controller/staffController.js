const Order = require('../model/order');

// 员工控制台
exports.getStaffConsole = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'staff') {
    return res.redirect('/login?as=staff');
  }

  try {
    const orders = await Order.findAll();
    res.render('staff', {
      user: req.session.user,
      orders
    });
  } catch (err) {
    res.status(500).send('Error loading staff console');
  }
};

// 更新订单状态
exports.updateOrderStatus = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'staff') {
    return res.redirect('/login?as=staff');
  }

  try {
    await Order.updateStatus(req.params.id, req.body.status);
    res.redirect('/staff');
  } catch (err) {
    res.status(500).send('Error updating order');
  }
};