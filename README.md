# FoodOrderingAndTrackingSystem
Description
This is a full-stack web application for ordering food from restaurants and tracking orders in real-time. 
It follows an MVC (Model-View-Controller) architecture, using MongoDB as the database. 
Users can browse restaurants, add items to their cart, checkout using Stripe for payments, track their orders, and leave comments. 
It includes user authentication and a staff console for managing order statuses.
The system supports secure payments, session-based authentication, and webhook integration for handling payment events.


Features
Restaurant Browsing: View a list of restaurants and detailed views of individual restaurants.
Cart Management: Add items to cart, update quantities, and proceed to checkout.
Payment Integration: Secure checkout using Stripe, with success and cancel handling.
Order Tracking: Real-time tracking of order status.
User Authentication: Register, login, logout, and session management.
Comments and Ratings: Add comments to restaurants; view rating and finish pages.
Staff Console: Staff can view orders and update their statuses.
Webhook Support: Handles Stripe events for payment confirmation.

Technologies Used

Backend: Node.js, Express.js
Database: MongoDB with Mongoose ORM
Frontend: EJS templating engine
Payments: Stripe API
Other: Body-parser for request handling, Express-session for sessions, Dotenv for environment variables
Static Assets: Served from /public directory (e.g., CSS files)

Installation
git clone https://github.com/LuxuriousLeisure/FoodOrderingAndTrackingSystem
npm install
npm start
The server will run on http://localhost:8099.

Usage

User Flow:
Visit / to browse restaurants.
Register or login at /login.
Add items to cart via /cart/add.
Proceed to /checkout and pay using Stripe.
Track orders at /tracking/:orderId.

Staff Flow:
Access /staff (assuming authentication/authorization is implemented for staff).
Update order statuses via /staff/order/:id/status.

Stripe Webhook Testing:
Use the provided script:textnpm run webhookThis forwards Stripe events to localhost:8099/webhook.

Configuration

Database: Ensure MongoDB is running and the connection URI is correctly set in .env.
Stripe: Obtain API keys from the Stripe dashboard and add to .env.
Port: The app listens on port 8099 by default (hardcoded in app.js).

Directory Structure

app.js: Main application file with server setup, middleware, and routes.
controller/: Contains controllers for auth, restaurants, orders, and staff.
model/: Database models (e.g., User, Restaurant, Order).
views/: EJS templates for rendering pages.
public/: Static files like CSS.
package.json: Project dependencies and scripts.







