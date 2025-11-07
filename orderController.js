
const Restaurant = require('../model/restaurant');
const Order = require('../model/order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Retrieve cart from session or DB if needed
    // Here we rely on metadata and recreate from line_items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

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

  res.json({ received: true });
};

// Success page
exports.checkoutSuccess = async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      req.session.cart = []; // Clear cart
      req.session.pendingCheckoutSessionId = null;
      res.render('success', { user: req.session.user });
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

exports.getTracking = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('tracking', { user: req.session.user });
};

exports.getRating = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('rating', { user: req.session.user });
};

exports.getFinish = (req, res) => {
  if (!req.session.user) return res.redirect('/login?as=user');
  res.render('finish', { user: req.session.user, role: req.session.user.role });
};

