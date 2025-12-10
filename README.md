# FoodOrderingAndTrackingSystem
Github repository: https://github.com/LuxuriousLeisure/FoodOrderingAndTrackingSystem

## 📝 Project Description
This is a full-stack web application for ordering food from restaurants and tracking orders in real-time.
- Follows an **MVC (Model-View-Controller)** architecture for clean code separation
- Uses **MongoDB** as the primary database for data persistence
- Supports core user workflows: restaurant browsing, cart management, secure payment, and real-time order tracking
- Includes user authentication and a dedicated staff console for order management
- Integrates Stripe webhooks to handle payment events and ensure transaction reliability

## ✨ Key Features
| Category          | Details                                                                 |
|-------------------|-------------------------------------------------------------------------|
| Restaurant Browsing | View restaurant list and detailed pages for individual restaurants     |
| Payment Integration | Secure checkout via Stripe (with success/cancel payment handling)       |
| Order Tracking     | Real-time monitoring of order status (pending/preparing/delivering)    |
| User Authentication | Register, login, logout, and session-based user state management        |
| Comments & Ratings | Add comments to restaurants; view rating summaries and order finish pages |
| Webhook Support    | Automatically handle Stripe payment confirmation events                |

## 🛠️ Technologies Used
### Backend
- Node.js (JavaScript runtime environment)
- Express.js (lightweight web framework for Node.js)
- MongoDB with Mongoose ORM (database and object modeling)

### Frontend
- EJS (Embedded JavaScript templating engine for dynamic HTML rendering)
- CSS (custom styles for responsive UI, served from static assets folder)

### Core Dependencies
- body-parser: Parse incoming request bodies (form data/JSON)
- express-session: Session management for user authentication
- dotenv: Load environment variables from `.env` file
- Stripe API: Secure payment processing and webhook integration

## 🚀 Installation & Setup
### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local instance or MongoDB Atlas cloud service)
- Stripe account (for API keys and webhook testing)
- Git (for cloning the repository)

## 🚀 How to Start
- Two terminals are required.

### 1️⃣ Stripe Webhook Listener
```bash
cd FoodOrderingAndTrackingSystem-main/
cd stripe_1.32.0_linux_x86_64/
chmod +x stripe
./stripe listen --forward-to localhost:8099/webhook
```
### 2️⃣ Start program
```bash
cd FoodOrderingAndTrackingSystem-main/
npm install
npm start
```
