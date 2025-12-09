
const Restaurant = require('../model/restaurant');
const Order = require('../model/order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Driver = require('../model/driver');
const User = require('../model/user');


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
    console.error(err);
    res.status(500).send('Error adding to cart');
  }
};

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

exports.getCheckout = (req, res) => {
  if (!req.session.user || !req.session.cart?.length) return res.redirect('/');
  
  const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  res.render('payment', {
    user: req.session.user,
    cart: req.session.cart,
    total,
    // THIS LINE FIXES THE ERROR
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
};

// Create Stripe Checkout Session
exports.createCheckoutSession = async (req, res) => {
  if (!req.session.user || !req.session.cart?.length) {
    return res.redirect('/');
  }

  try {
    const total = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.session.cart.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            metadata: {
              dishId: item._id.toString(),
              restaurantId: item.restaurantId
            }
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.DOMAIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/checkout/cancel`,
      metadata: {
        userId: req.session.user.id,
        userEmail: req.session.user.email
      }
    });

    // Save pending order with session ID
    req.session.pendingCheckoutSessionId = session.id;
    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

// Webhook to handle successful payment
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log("testing");
  if (event.type === 'checkout.session.completed') {
    try{
    const session = event.data.object;
    console.log("function running");
    // Retrieve cart from session or DB if needed
    // Here we rely on metadata and recreate from line_items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id,{
      expand: ['data.price.product']
    });

    const items = lineItems.data.map(item => ({
      _id: item.price.product.metadata.dishId,
      name: item.price.product.name,
      price: item.price.unit_amount / 100,
      quantity: item.quantity,
      restaurantId: item.price.product.metadata.restaurantId
    }));

    await Order.create({
      userId: session.metadata.userId,
      userEmail: session.metadata.userEmail,
      items,
      total: session.amount_total / 100,
      paymentMethod: 'stripe',
      stripeSessionId: session.id,
      status: 'paid',
      restaurantId: items[0]?.restaurantId
    });

    console.log(`Payment succeeded for session ${session.id}`);
  }
	catch(err){
	console.error('Error processing webhook:', err);
  }
  res.json({ received: true });
  
  
  }
};

// Success page
// exports.checkoutSuccess = async (req, res) => {
//   const sessionId = req.query.session_id;

//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     if (session.payment_status === 'paid') {
//       req.session.cart = []; // Clear cart
//       req.session.pendingCheckoutSessionId = null;
//       res.render('success', { user: req.session.user });
//     } else {
//       res.redirect('/checkout/cancel');
//     }
//   } catch (err) {
//     res.redirect('/checkout/cancel');
//   }
// };
exports.checkoutSuccess = async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      // 1. 清空购物车（保留原有逻辑）
      req.session.cart = [];
      req.session.pendingCheckoutSessionId = null;

      // 2. 通过Stripe会话ID查询对应的订单（关键步骤）
      const order = await Order.findOne({ stripeSessionId: sessionId }); 
      // 注意：Order模型需要添加findOne方法（见步骤3）

      if (order) {
        // 3. 重定向到订单跟踪页面
        return res.redirect(`/tracking/${order._id}`);
      } else {
        // 订单查询失败时的降级处理（可选）
        return res.render('success', { user: req.session.user, error: 'Order not found' });
      }
    } else {
      res.redirect('/checkout/cancel');
    }
  } catch (err) {
    res.redirect('/checkout/cancel');
  }
};

// Cancel page
exports.checkoutCancel = (req, res) => {
  res.render('cancel', { user: req.session.user });
};

// Track order
// exports.getTracking = async (req, res) => {
//     if (!req.session.user) return res.redirect('/login?as=user');

//     try {
//         const orderId = req.params.orderId;

//         const order = await Order.findById(orderId).lean();
//         if (!order) return res.status(404).send("Order not found");

//         const driver = await Driver.findById(order.driverId).lean();
//         const restaurant = await Restaurant.findById(order.restaurantId).lean();
//         const user = await User.findById(order.userId).lean();

//         // DEMO: move driver slightly each refresh
//         const newLat = driver.location.lat + (Math.random() * 0.002 - 0.001);
//         const newLng = driver.location.lng + (Math.random() * 0.002 - 0.001);

//         await Driver.findByIdAndUpdate(order.driverId, {
//             location: { lat: newLat, lng: newLng }
//         });

//         res.render("track", {
//             user: req.session.user,
//             order,
//             restaurant: restaurant.location,
//             userLoc: user.location,
//             driver: { lat: newLat, lng: newLng }
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error loading tracking page");
//     }
// };
// exports.getTracking = async (req, res) => {
//     if (!req.session.user) return res.redirect('/login?as=user');

//     try {
//         const orderId = req.params.orderId;
        
//         // 修复点1：校验orderId是否为合法的ObjectId（避免转换报错）
//         const { ObjectId } = require('mongodb');
//         if (!ObjectId.isValid(orderId)) {
//             return res.status(400).send("Invalid order ID format");
//         }

//         // 修复点2：移除所有.lean()（自定义方法返回的是普通对象，无需lean）
//         const order = await Order.findById(orderId);
//         if (!order) return res.status(404).send("Order not found");

//         // 修复点3：对driverId判空，避免访问null.location
//         let driverLoc = { lat: 0, lng: 0 }; // 兜底默认值
//         if (order.driverId) {
//             const driver = await Driver.findById(order.driverId);
//             // if (driver && driver.location) {
//             if (driver && driver.currentLocation) { // 改为currentLocation
//                 // 仅当driver和location存在时，才更新司机位置
//                 const newLat = driver.location.lat + (Math.random() * 0.002 - 0.001);
//                 const newLng = driver.location.lng + (Math.random() * 0.002 - 0.001);
//                 driverLoc = { lat: newLat, lng: newLng };
//                 // await Driver.findByIdAndUpdate(order.driverId, { location: driverLoc });
//                 await Driver.updateLocation(order.driverId, driverLoc); // 调用updateLocation更新
//             }
//         }

//         // 修复点4：对restaurant/user的location判空，兜底默认值
//         const restaurant = await Restaurant.findById(order.restaurantId);
//         const restaurantLoc = restaurant?.location || { lat: 0, lng: 0 };
        
//         const user = await User.findById(order.userId);
//         const userLoc = user?.location || { lat: 0, lng: 0 };

//         // 渲染页面，所有字段都有兜底，不会崩
//         res.render("track", {
//             user: req.session.user,
//             order,
//             restaurant: restaurantLoc,
//             userLoc: userLoc,
//             driver: driverLoc
//         });

//     } catch (err) {
//         console.error("Tracking page error:", err);
//         // 明确报错信息，方便排查
//         res.status(500).send(`Error loading tracking page: ${err.message}`);
//     }
// };
// orderController.js (getTracking 方法)

exports.getTracking = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).send("Order not found");
        }
        
        // 1. 定义真实的默认坐标 (从 driver.js 模型中获取)
        // 订单未分配司机或数据缺失时，使用此默认值
        const DEFAULT_DRIVER_LOCATION = { lat: 22.29, lng: 114.16 }; 
        let driverLoc = DEFAULT_DRIVER_LOCATION; 
        
        if (order.driverId) {
            const Driver = require('../model/driver'); // 确保在此作用域内导入 Driver 模型
            let driver = await Driver.findById(order.driverId);
            
            // 2. 读取数据库中的真实坐标
            if (driver && driver.currentLocation) {
                driverLoc = driver.currentLocation;
            }
            
            // 3. 模拟实时位置更新 (确保引用的是 currentLocation)
            // 只有当 driverLoc 有真实坐标时，才进行模拟更新
            if (driver && driver.currentLocation) { 
                const newLat = driver.currentLocation.lat + (Math.random() * 0.002 - 0.001);
                const newLng = driver.currentLocation.lng + (Math.random() * 0.002 - 0.001);
                driverLoc = { lat: newLat, lng: newLng };
                await Driver.updateLocation(order.driverId, driverLoc); 
            }
        }

        // 4. 餐厅和用户位置的读取保持不变
        const Restaurant = require('../model/restaurant'); // 确保导入
        const User = require('../model/user'); // 确保导入

        const restaurant = await Restaurant.findById(order.restaurantId);
        // 餐厅和用户位置如果缺失，也使用香港的默认值，防止地图崩溃
        const restaurantLoc = restaurant?.location || { lat: 22.3, lng: 114.175 }; 
        
        const user = await User.findById(order.userId);
        const userLoc = user?.location || { lat: 22.3, lng: 114.175 };
        
        // 5. 渲染页面
        res.render("track", {
            user: req.session.user,
            order,
            restaurant: restaurantLoc,
            userLoc: userLoc, // 这是你之前修复成功的 User 变量名
            driver: driverLoc
        });

    } catch (err) {
        console.error("Tracking page error:", err);
        res.status(500).send(`Error loading tracking page: ${err.message}`);
    }
};

exports.getRating = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('rating', { user: req.session.user });
};

exports.getFinish = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('finish', { user: req.session.user, role: req.session.user.role });
};

