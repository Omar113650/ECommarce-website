# E-Commerce Backend System

**Complete E-Commerce Backend with Products, Cart, Wishlist, Orders, Payments, Google Authentication, and Cloud Storage**

A complete E-Commerce backend application built with Node.js and Express.js.

The platform provides the core infrastructure required for a modern online shopping system, including authentication, product management, categories, brands, shopping carts, wishlists, offers, orders, Stripe payments, payment webhooks, Google authentication, file uploads, email services, and administrative functionality.

The project follows a structured backend architecture that separates routes, controllers, models, middleware, validation, configuration, and external services.

---

## Table of Contents

1. Project Overview
2. Core Features
3. Tech Stack
4. System Architecture
5. Authentication
6. Google Authentication
7. Product Management
8. Category Management
9. Brand Management
10. Offers
11. Shopping Cart
12. Wishlist
13. Order Management
14. Payment System
15. Stripe Webhooks
16. Blog System
17. Contact System
18. File Uploads
19. Email Services
20. Validation and Error Handling
21. Project Structure
22. Environment Configuration
23. Installation and Setup
24. Engineering Highlights
25. Future Enhancements
26. Author

---

# Project Overview

The E-Commerce Backend System provides the server-side infrastructure required to operate an online shopping platform.

The system manages the complete shopping lifecycle:

```text
User Registration
        |
        v
Authentication
        |
        v
Browse Products
        |
        v
Search / Categories / Brands
        |
        v
Add to Cart
        |
        v
Checkout
        |
        v
Create Order
        |
        v
Stripe Payment
        |
        v
Payment Webhook
        |
        v
Confirm Order
```

The platform also provides supporting functionality including wishlists, offers, blogs, contact messages, Google authentication, cloud-based media storage, and email services.

---

# Core Features

The backend includes:

- User Registration and Authentication
- Google Authentication
- Product Management
- Category Management
- Brand Management
- Shopping Cart
- Wishlist
- Order Management
- Offers and Promotions
- Stripe Payment Integration
- Stripe Webhook Handling
- Blog Management
- Contact Us System
- Cloudinary Integration
- File Upload Management
- Email Services
- Request Validation
- ID Validation
- Authentication Middleware
- Centralized Error Handling

---

# Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | Token-Based Authentication |
| Google Authentication | Passport.js |
| Payments | Stripe |
| Payment Events | Stripe Webhooks |
| File Upload | Multer |
| Cloud Storage | Cloudinary |
| Email | Email Service |
| Validation | Custom Validation Middleware |
| Deployment Configuration | Vercel |
| Architecture | Route / Controller / Model Architecture |

---

# System Architecture

The backend follows a layered Express architecture:

```text
                        Client Application
                               |
                               v
                          Express API
                               |
               --------------------------------
               |              |               |
               v              v               v
          Validation     Authentication     Middleware
               |
               v
             Routes
               |
               v
          Controllers
               |
               v
         Business Logic
               |
       ----------------------
       |                    |
       v                    v
    MongoDB           External Services
       |                    |
       v          -------------------------
    Mongoose       |          |            |
                   v          v            v
                Stripe    Cloudinary     Email
```

This separation makes the backend easier to maintain and extend.

---

# Authentication

Authentication functionality is organized through:

```text
controllers/
    AuthController.js

routes/
    AuthRoute.js

middlewares/
    VerifyToken.js

models/
    users.js
```

The authentication system is responsible for identifying users and protecting private endpoints.

A typical authentication flow:

```text
Register
   |
   v
Validate Request
   |
   v
Create User
   |
   v
Login
   |
   v
Validate Credentials
   |
   v
Generate Authentication Token
   |
   v
Client Sends Token
   |
   v
VerifyToken Middleware
   |
   v
Protected Resource
```

---

# Google Authentication

The project contains dedicated Google authentication functionality.

Relevant files include:

```text
config/
    passport.js

models/
    LoginGoogle.js
```

Passport.js handles the authentication strategy.

Conceptually:

```text
User
 |
 v
Login with Google
 |
 v
Passport.js
 |
 v
Google Authentication
 |
 v
User Profile
 |
 v
Create / Find User
 |
 v
Authenticated Session
```

This provides users with an alternative to traditional email and password authentication.

---

# Product Management

Products represent the main resources of the E-Commerce platform.

Implementation:

```text
controllers/
    ProductsController.js

models/
    Product.js

routes/
    ProductRoute.js
```

The product module handles operations such as:

- Create products
- Retrieve products
- Update products
- Delete products
- Associate products with categories
- Associate products with brands
- Manage product information
- Manage product media
- Handle pricing

---

# Category Management

Products can be organized into categories.

Implementation:

```text
controllers/
    CategoryControllers.js

models/
    Category.js

routes/
    CategoryRoute.js
```

Relationship:

```text
Category
   |
   +---- Product
   |
   +---- Product
   |
   +---- Product
```

Categories make product organization and discovery easier.

---

# Brand Management

The platform provides a dedicated brand management module.

Implementation:

```text
controllers/
    BrandController.js

models/
    Brand.js

routes/
    BrandRoute.js
```

Products can be associated with brands to provide additional filtering and organization.

Conceptually:

```text
Brand
  |
  +---- Product
  |
  +---- Product
  |
  +---- Product
```

---

# Offers and Promotions

The platform includes a dedicated offers module.

Implementation:

```text
controllers/
    OffersControllers.js

routes/
    OfferRoute.js
```

Offers can be used to provide promotional functionality within the store.

They can be integrated with products and checkout logic depending on the business rules of the application.

---

# Shopping Cart

The shopping cart allows users to prepare products before completing an order.

Implementation:

```text
controllers/
    CartController.js

models/
    Cart.js

routes/
    CartRoute.js
```

The cart system can handle operations such as:

- Add product to cart
- Remove product from cart
- Update product quantity
- Retrieve user cart
- Calculate cart contents
- Prepare products for checkout

Typical flow:

```text
User
 |
 v
Select Product
 |
 v
Add to Cart
 |
 v
Validate Product
 |
 v
Update Cart
 |
 v
Continue Shopping
      |
      v
   Checkout
```

---

# Wishlist

The wishlist allows users to save products for future consideration.

Implementation:

```text
controllers/
    WishlistController.js

models/
    Wishlist.js

routes/
    WishlistRoute.js
```

Typical operations include:

- Add product to wishlist
- Remove product from wishlist
- Retrieve wishlist
- Save products for later

Conceptually:

```text
User
 |
 v
Product
 |
 v
Add to Wishlist
 |
 v
Wishlist
```

---

# Order Management

Orders represent completed or pending purchase requests.

Implementation:

```text
controllers/
    OrderController.js

models/
    Order.js

routes/
    OrderRoute.js
```

The order module is responsible for handling the relationship between users, products, checkout, and payments.

A typical order workflow:

```text
Shopping Cart
     |
     v
Checkout
     |
     v
Validate Order Data
     |
     v
Create Order
     |
     v
Create Payment
     |
     v
Payment Processing
     |
     v
Update Order
```

---

# Order Lifecycle

An order can move through several business states depending on the implementation.

Conceptually:

```text
PENDING
   |
   v
PAID
   |
   v
PROCESSING
   |
   v
SHIPPED
   |
   v
DELIVERED
```

Alternative transitions can include cancellation or payment failure.

Explicit order states make order processing easier to maintain.

---

# Payment System

The project contains a dedicated payment layer.

Relevant files:

```text
controllers/
    PaymentController.js

models/
    Stripe.js

routes/
    paymentRoute.js
```

Stripe is used as the payment provider.

A typical payment flow:

```text
User
 |
 v
Checkout
 |
 v
Order
 |
 v
Payment Controller
 |
 v
Stripe
 |
 v
Payment Processing
 |
 v
Payment Result
```

Keeping payment logic separated from product and cart logic makes the application easier to maintain.

---

# Stripe Integration

Stripe provides the external payment infrastructure for the platform.

Conceptually:

```text
E-Commerce Backend
        |
        v
Payment Controller
        |
        v
Stripe API
        |
        v
Payment Processing
        |
        v
Payment Result
```

Sensitive payment operations should always be performed or verified by the backend.

The client should never be trusted to determine whether an order has been successfully paid.

---

# Stripe Webhooks

The project includes dedicated Stripe webhook handling.

Implementation:

```text
controllers/
    webhookController.js

routes/
    stripeWebhook.js
```

Webhooks allow Stripe to notify the backend when payment-related events occur.

The flow follows:

```text
Customer
   |
   v
Stripe Payment
   |
   v
Stripe
   |
   v
Webhook Event
   |
   v
stripeWebhook
   |
   v
webhookController
   |
   v
Verify Event
   |
   v
Update Payment / Order
```

This is important because the backend should not depend only on the client redirect or frontend response to confirm payments.

Stripe can communicate the final payment result directly to the server.

---

# Why Webhooks Matter

Consider this situation:

```text
User Completes Payment
        |
        v
Payment Successful
        |
        v
User Closes Browser
```

If the backend depends entirely on the frontend to report success, the order may never be updated.

With a webhook:

```text
Stripe
   |
   v
Backend Webhook
   |
   v
Update Order
```

The payment result can still be processed independently of the user's browser.

---

# Blog System

The E-Commerce platform also includes a blog module.

Implementation:

```text
controllers/
    BlogController.js

models/
    Blog.js

routes/
    BlogRoute.js
```

The blog system can be used for content such as:

- Store announcements
- Product guides
- News
- Marketing content
- Educational articles

This allows content management to exist within the same backend platform.

---

# Contact System

The platform contains a Contact Us module.

Implementation:

```text
controllers/
    ContactusController.js

models/
    Contactus.js

routes/
    ContactRoute.js
```

A typical flow:

```text
Visitor
  |
  v
Contact Form
  |
  v
Validate Request
  |
  v
Contact Controller
  |
  v
Store Message
```

This provides a structured way to manage customer inquiries.

---

# File Upload Management

The project contains dedicated file upload functionality.

Implementation:

```text
utils/
    multer.js
```

Multer processes multipart/form-data requests.

A typical upload flow:

```text
Client
  |
  v
Upload Image
  |
  v
Multer
  |
  v
Validate File
  |
  v
Cloudinary
  |
  v
Store Image URL
```

This can be used for product images and other media resources.

---

# Cloudinary Integration

Cloud storage functionality is implemented through:

```text
utils/
    Cloudinary.js
```

Cloudinary can store uploaded assets outside the application server.

Conceptually:

```text
Product Image
     |
     v
Multer
     |
     v
Cloudinary
     |
     v
Cloud URL
     |
     v
Product
```

This avoids depending entirely on local server storage for uploaded assets.

---

# Email Services

The project contains a dedicated email utility:

```text
utils/
    emailServices.js
```

Email functionality can support account and platform communication.

Examples include:

- Account-related emails
- Authentication emails
- Order-related emails
- Payment-related emails
- Customer communication

Keeping email logic inside a shared utility avoids duplicating email implementation across controllers.

---

# Validation

Request validation is separated from controller logic.

Relevant files:

```text
middlewares/
    Validate.js
    validateID.js

validation/
```

A typical request flow:

```text
HTTP Request
     |
     v
Validate Request
     |
     v
Validate ID
     |
     v
Verify Authentication
     |
     v
Controller
     |
     v
Business Logic
```

This keeps invalid requests from reaching core application logic.

---

# Authentication Middleware

Protected routes use:

```text
middlewares/
    VerifyToken.js
```

Conceptually:

```text
Request
  |
  v
Read Token
  |
  v
Verify Token
  |
  +---- Invalid -> Reject Request
  |
  +---- Valid
          |
          v
     Attach User
          |
          v
      Controller
```

This provides centralized authentication protection.

---

# Error Handling

The project includes centralized error handling:

```text
middlewares/
    error.js
```

Centralized error handling helps provide consistent API responses.

Typical HTTP errors include:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Instead of implementing separate error handling logic inside every controller, errors can be forwarded to shared middleware.

---

# Database Models

The main models include:

```text
Blog.js
Brand.js
Cart.js
Category.js
Contactus.js
LoginGoogle.js
Order.js
Product.js
Stripe.js
Wishlist.js
users.js
```

A simplified domain relationship can be represented as:

```text
User
 |
 +---- Cart
 |
 +---- Wishlist
 |
 +---- Orders
 |
 +---- Payments


Category
 |
 +---- Products


Brand
 |
 +---- Products


Order
 |
 +---- Products
 |
 +---- Payment
```

---

# Project Structure

The actual project structure follows:

```text
config/
|-- connectDB.js
`-- passport.js

controllers/
|-- AuthController.js
|-- BlogController.js
|-- BrandController.js
|-- CartController.js
|-- CategoryControllers.js
|-- ContactusController.js
|-- OffersControllers.js
|-- OrderController.js
|-- PaymentController.js
|-- ProductsController.js
|-- WishlistController.js
`-- webhookController.js

middlewares/
|-- Validate.js
|-- VerifyToken.js
|-- error.js
`-- validateID.js

models/
|-- Blog.js
|-- Brand.js
|-- Cart.js
|-- Category.js
|-- Contactus.js
|-- LoginGoogle.js
|-- Order.js
|-- Product.js
|-- Stripe.js
|-- Wishlist.js
`-- users.js

routes/
|-- AuthRoute.js
|-- BlogRoute.js
|-- BrandRoute.js
|-- CartRoute.js
|-- CategoryRoute.js
|-- ContactRoute.js
|-- OfferRoute.js
|-- OrderRoute.js
|-- ProductRoute.js
|-- WishlistRoute.js
|-- paymentRoute.js
`-- stripeWebhook.js

utils/
|-- Cloudinary.js
|-- emailServices.js
`-- multer.js

validation/

.gitignore
README.md
index.js
package-lock.json
package.json
vercel.json
```

The overall request flow follows:

```text
Client
  |
  v
Route
  |
  v
Middleware
  |
  v
Controller
  |
  v
Model / External Service
  |
  v
Response
```

---

# Database Connection

Database configuration is separated into:

```text
config/
    connectDB.js
```

This keeps database initialization outside the main application entry point.

Conceptually:

```text
Application Start
       |
       v
connectDB
       |
       v
MongoDB
       |
       v
Start Express Server
```

---

# Environment Configuration

The exact environment variable names should match the implementation, but the project may require configuration similar to:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

Never commit real credentials, secrets, or API keys to Git.

---

# Installation and Setup

## Requirements

Install:

- Node.js
- MongoDB
- npm

---

## Clone Repository

```bash
git clone <repository-url>
cd <project-directory>
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create the required `.env` file and configure:

- MongoDB
- Authentication
- Google OAuth
- Stripe
- Cloudinary
- Email service

---

## Start Application

Use the development or production script configured inside `package.json`.

For example:

```bash
npm run dev
```

or:

```bash
npm start
```

---

# Deployment

The project contains:

```text
vercel.json
```

This provides Vercel-specific deployment configuration.

The exact deployment behavior depends on the configuration defined inside the file.

---

# Engineering Highlights

This project demonstrates several important backend engineering concepts beyond standard CRUD operations.

## Complete E-Commerce Workflow

The system connects products, carts, wishlists, orders, and payments into a complete shopping workflow.

## Payment Webhooks

Stripe webhooks provide server-to-server payment event handling instead of depending entirely on frontend confirmation.

## External Authentication

Passport.js provides Google authentication alongside the application's standard authentication system.

## Separation of Concerns

Routes, controllers, models, middleware, utilities, validation, and configuration are separated into dedicated layers.

## Cloud-Based Media Management

Multer and Cloudinary separate file upload processing from permanent cloud storage.

## Centralized Authentication

VerifyToken middleware protects private resources without duplicating authentication logic.

## Centralized Error Handling

Shared error middleware provides consistent application error handling.

## Request Validation

Validation occurs before requests reach business logic.

## Multiple Business Domains

The backend manages products, categories, brands, offers, carts, wishlists, orders, payments, blogs, and customer contact requests.

---

# Security Considerations

Important security considerations for the platform include:

- Authentication token verification
- Protected private routes
- Request validation
- ID validation
- Secure password storage
- Server-side payment verification
- Stripe webhook verification
- Secure Google OAuth configuration
- Secure file upload handling
- Environment variable protection

Payment status should always be verified by the backend rather than trusted from the frontend.

Stripe webhook signatures should also be validated before processing payment events.

---

# Future Enhancements

Possible future improvements include:

- Redis caching
- Rate limiting
- Helmet security headers
- HPP protection
- Advanced Role-Based Access Control
- Product inventory management
- Inventory reservation during checkout
- Coupon system
- Advanced product search
- Product reviews and ratings
- Order tracking
- Background jobs
- Email queues
- Docker containerization
- Nginx reverse proxy
- CI/CD pipelines
- Automated testing
- Structured logging
- Error monitoring
- API performance monitoring
- Swagger / OpenAPI documentation
- Horizontal scaling

---

# Use Cases

## Customer

A customer can:

- Register
- Login
- Authenticate with Google
- Browse products
- Browse categories
- Browse brands
- Add products to cart
- Manage shopping cart
- Add products to wishlist
- Create orders
- Complete payments
- Read blog content
- Submit contact requests

## Administrator

An administrator can manage platform resources such as:

- Products
- Categories
- Brands
- Offers
- Orders
- Blog content
- Customer-related data

---

# Final Note

This E-Commerce Backend demonstrates the architecture of a complete online shopping backend built with Node.js, Express.js, MongoDB, and external service integrations.

The project goes beyond basic CRUD functionality by implementing shopping carts, wishlists, order processing, Stripe payments, server-side payment webhooks, Google authentication with Passport.js, Cloudinary-based media storage, email services, validation, and centralized error handling.

The separation between routes, controllers, models, middleware, configuration, validation, and utilities provides a maintainable foundation that can evolve into a larger production E-Commerce platform.

---

# Author

**Omar Elhelaly**

Backend Developer specializing in:

- Node.js
- Express.js
- MongoDB
- Mongoose
- RESTful APIs
- Authentication
- Google OAuth
- Stripe Payments
- Payment Webhooks
- Cloudinary
- File Upload Systems
- E-Commerce Systems
- Backend Architecture
