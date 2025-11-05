const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { connectDB } = require('./model/db');

// 控制器导入
const authController = require('./controller/authController');
const restaurantController = require('./controller/restaurantController');
const orderController = require('./controller/orderController');
const staffController = require('./controller/staffController');

const app = express();
const PORT = 8099;

// 中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'food-order-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1天有效期
}));
app.set('view engine', 'ejs');

// 路由
app.get('/', restaurantController.getAllRestaurants);
app.get('/restaurant/:id', restaurantController.getRestaurantById);
app.post('/restaurant/:id/comment', restaurantController.addComment);

app.post('/cart/add', orderController.addToCart);
app.post('/cart/update', orderController.updateCart);
app.get('/checkout', orderController.getCheckout);
app.post('/order/create', orderController.createOrder);
app.get('/tracking', orderController.getTracking);
app.get('/rating', orderController.getRating);
app.get('/finish', orderController.getFinish);

app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.post('/register', authController.postRegister);
app.get('/logout', authController.logout);

app.get('/staff', staffController.getStaffConsole);
app.post('/staff/order/:id/status', staffController.updateOrderStatus);

// 启动服务器
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();