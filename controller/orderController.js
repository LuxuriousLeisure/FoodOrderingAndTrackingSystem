const Restaurant = require('../model/restaurant');
const Order = require('../model/order');

// 添加到购物车
exports.addToCart = async (req, res) => {
  if (!req.session.user) {
    req.session.redirectTo = `/restaurant/${req.body.restaurantId}`;
    return res.redirect('/login?as=user');
  }

  try {
    const dish = await Restaurant.getDishes(req.body.restaurantId)
      .then(dishes => dishes.find(d => d._id.toString() === req.body.dishId));

    if (!dish) return res.redirect(`/restaurant/${req.body.restaurantId}`);

    req.session.cart = req.session.cart || [];
    const existing = req.session.cart.find(item => item._id.toString() === dish._id.toString());
    
    if (existing) {
      existing.quantity++;
    } else {
      req.session.cart.push({ ...dish, quantity: 1 });
    }

    res.redirect(`/restaurant/${req.body.restaurantId}`);
  } catch (err) {
    res.status(500).send('Error adding to cart');
  }
};

// 更新购物车
exports.updateCart = (req, res) => {
  if (!req.session.cart) return res.redirect('/');

  const { dishId, action } = req.body;
  const item = req.session.cart.find(item => item._id.toString() === dishId);
  
  if (item) {
    if (action === 'inc') item.quantity++;
    if (action === 'dec' && item.quantity > 1) item.quantity--;
    if (action === 'del') req.session.cart = req.session.cart.filter(i => i._id.toString() !== dishId);
  }

  res.redirect(`/restaurant/${req.body.restaurantId}`);
};

// 结算页
exports.getCheckout = (req, res) => {
  if (!req.session.user || !req.session.cart?.length) return res.redirect('/');
  
  const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  res.render('payment', {
    user: req.session.user,
    cart: req.session.cart,
    total
  });
};

// 创建订单
exports.createOrder = async (req, res) => {
  if (!req.session.user || !req.session.cart?.length) return res.redirect('/');

  try {
    const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await Order.create({
      userId: req.session.user.id,
      items: req.session.cart,
      total,
      paymentMethod: req.body.payMethod,
      note: req.body.orderNote,
      restaurantId: req.session.cart[0].restaurantId
    });

    req.session.cart = [];
    res.redirect('/tracking');
  } catch (err) {
    res.status(500).send('Error creating order');
  }
};

// 订单跟踪
exports.getTracking = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('tracking', { user: req.session.user });
};

// 评分页
exports.getRating = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('rating', { user: req.session.user });
};

// 完成页
exports.getFinish = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('finish', { user: req.session.user, role: req.session.user.role });
};