const https=require("https");
const fs=require('fs');
const path = require('path');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { connectDB } = require('./model/db');

// Controllers
const authController = require('./controller/authController');
const restaurantController = require('./controller/restaurantController');
const orderController = require('./controller/orderController');
const staffController = require('./controller/staffController');

const app = express();
const PORT = 8099;

// Webhook endpoint for Stripe
app.post('/webhook', express.raw({type: 'application/json'}), orderController.stripeWebhook);
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'food-order-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.set('view engine', 'ejs');
//app.use(express.static(path.join(__dirname, 'public'))); // 让Express托管public目录下的静态文件
// Make Stripe key available to views

// Routes
app.get('/', restaurantController.getAllRestaurants);
app.get('/restaurant/:id', restaurantController.getRestaurantById);
app.post('/restaurant/:id/comment', restaurantController.addComment);

app.post('/cart/add', orderController.addToCart);
app.post('/cart/update', orderController.updateCart);
app.get('/checkout', orderController.getCheckout);
app.post('/create-checkout-session', orderController.createCheckoutSession);
app.get('/checkout/success', orderController.checkoutSuccess);
app.get('/checkout/cancel', orderController.checkoutCancel);

app.get('/tracking/:orderId', orderController.getTracking);
app.get('/rating', orderController.getRating);
app.get('/finish', orderController.getFinish);

app.get('/login', authController.getLogin);
app.post('/login', authController.postLogin);
app.post('/register', authController.postRegister);
app.get('/logout', authController.logout);

app.get('/staff', staffController.getStaffConsole);
app.post('/staff/order/:id/status', staffController.updateOrderStatus);

app.put('/api/sendGeo',authController.getLocation);


// Start server
async function start() {
  await connectDB();
  
  const options = {
    key: fs.readFileSync('cert.key'),
    cert: fs.readFileSync('cert.crt')
  };
  https.createServer(options, app).listen(PORT, () => {
    console.log(` running on https://localhost:${PORT}`);
	console.log(`Stripe Webhook Testing: stripe listen --forward-to localhost:${PORT}/webhook`);
  });
}

/* else {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Stripe Webhook Testing: stripe listen --forward-to localhost:${PORT}/webhook`);
  });
}

}*/

start();

