# 🛒 E-commerce Backend API

A production-ready RESTful backend API for a complete e-commerce platform built with **Node.js**, **Express.js**, and **MongoDB**. Features include JWT authentication with role-based access control, product management, shopping cart, order processing, Razorpay payment integration, product reviews, wishlist, and comprehensive Swagger/OpenAPI documentation.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-orange)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Live Demo](#-live-demo)
- [Folder Structure](#-folder-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
  - [Auth APIs](#1-auth-apis)
  - [Product APIs](#2-product-apis)
  - [Cart APIs](#3-cart-apis)
  - [Order APIs](#4-order-apis)
  - [Payment APIs](#5-payment-apis)
  - [Review APIs](#6-review-apis)
  - [Wishlist APIs](#7-wishlist-apis)
- [Authentication Flow](#-authentication-flow)
- [Testing](#-testing)
- [Swagger Documentation](#-swagger-documentation)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- ✅ **JWT Authentication** — Secure login/register with token-based auth
- ✅ **Role-Based Access Control (RBAC)** — Three roles: `user`, `admin`, `seller`
- ✅ **Product Management** — Full CRUD with soft-delete and image upload to Cloudinary
- ✅ **Shopping Cart** — Add, update, remove items with stock validation
- ✅ **Order Management** — Place orders, cancel with automatic stock restoration
- ✅ **Razorpay Payment Integration** — Secure online payments with signature verification
- ✅ **Product Reviews** — Rating and comments with auto-calculated product ratings
- ✅ **Wishlist** — Save favorite products for later
- ✅ **Inventory Management** — Low-stock and out-of-stock alerts for admins

### Security Features
- 🔒 **Rate Limiting** — Prevents brute-force and DDoS attacks
- 🔒 **Helmet** — HTTP security headers (XSS, clickjacking protection)
- 🔒 **CORS** — Configurable origin whitelist
- 🔒 **MongoDB Sanitization** — Prevents NoSQL injection
- 🔒 **XSS Protection** — Cleans malicious input
- 🔒 **Request Body Size Limit** — Prevents large payload attacks
- 🔒 **Password Hashing** — bcrypt with 10 salt rounds

### Developer Experience
- 📚 **Swagger/OpenAPI 3.0** — Interactive API documentation at `/api-docs`
- 📝 **Request Logging** — Morgan logger for dev and production
- 🗜️ **Response Compression** — Gzip compression for faster responses
- 💚 **Health Check** — `/health` endpoint for monitoring
- 🚨 **Global Error Handler** — Consistent error responses across all endpoints

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js 4.x |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs |
| **Payment Gateway** | Razorpay |
| **File Storage** | Cloudinary |
| **API Docs** | Swagger UI + swagger-jsdoc |
| **Validation** | express-validator |
| **Security** | helmet, express-rate-limit, xss-clean, express-mongo-sanitize |
| **Logging** | morgan |
| **Compression** | compression |
| **File Upload** | multer |

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **API Base URL** | `https://e-commerce-api-qjeq.onrender.com` |
| **Swagger Docs** | `https://e-commerce-api-qjeq.onrender.com/api-docs` |
| **Health Check** | `https://e-commerce-api-qjeq.onrender.com/health` |
| **OpenAPI JSON** | `https://e-commerce-api-qjeq.onrender.com/api-docs.json` |

> ⚠️ **Note:** Free tier Render hosting may cause 15-30 second cold start delays after 15 minutes of inactivity.

---

## 📁 Folder Structure

```
ecommerce-backend/
│
├── config/
│   ├── db.js                    # MongoDB connection
│   ├── cloudinary.js            # Cloudinary Configuation
│   ├── razorpay.js              # Razorpay instance config
│   └── swagger.js               # Swagger/OpenAPI specification
│
├── controllers/
│   ├── authController.js        # Register, Login, GetMe
│   ├── cartController.js        # Cart CRUD operations
│   ├── orderController.js       # Order create, cancel, status
│   ├── productController.js     # Product CRUD, search, filter, images
│   ├── razorpayController.js    # Payment create + verify
│   ├── reviewController.js      # Review CRUD
│   └── wishlistController.js    # Wishlist CRUD
│
├── middleware/
│   ├── authMiddleware.js        # JWT verify (protect)
│   ├── roleMiddleware.js        # Role-based access (authorize)
│   ├── productMiddleware.js     # Product ownership check
│   ├── uploadMiddleware.js      # Multer config (5MB, images only)
│   ├── rateLimiter.js           # Rate limiting configs
│   └── errorMiddleware.js       # Global error handler
│   └── validator.js             # Express validator rules
│
├── models/
│   ├── User.js                  # User schema
│   ├── Product.js               # Product schema
│   ├── Cart.js                  # Cart schema
│   ├── Order.js                 # Order schema
│   ├── Review.js                # Review schema
│   └── Wishlist.js              # Wishlist schema
│
├── routes/
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoute.js
│   ├── productRoutes.js
│   ├── reviewRoutes.js
│   └── wishlistRoute.js
│
├── utils/
│   ├── cartCalculator.js        # Cart totals calculation
│   ├── uploadToCloudinary.js    # Cloudinary upload helper
│   └── deleteFromCloudinary.js  # Cloudinary delete helper
│
├── .env                         # Environment variables (NOT pushed)
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js                    # Entry point
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary Account** — [Sign up](https://cloudinary.com/)
- **Razorpay Account** — [Sign up](https://razorpay.com/)

### Step 1: Clone Repository

```bash
git clone https://github.com/alijafar000/E-commerce-API.git
cd backend-ecommerce
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Environment Variables

```bash
cp .env.example .env
```

Ab `.env` file me apni values daalo (see [Environment Variables](#-environment-variables)).

### Step 4: Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start at: `http://localhost:8000`

### Step 5: Verify Installation

Open in browser:
- API Root: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/api-docs`
- Health Check: `http://localhost:8000/health`

---

## 🔐 Environment Variables

Create `.env` file in root directory with following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-frontend.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### `.env.example` Template

```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
ALLOWED_ORIGINS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

> ⚠️ **NEVER commit your `.env` file to GitHub!**

---

## 📡 API Endpoints

**Base URL:** `http://localhost:8000` (dev) or `https://e-commerce-api-qjeq.onrender.com` (production)

**Total APIs:** 37+

---

### 1. Auth APIs

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Public | Register new user |
| POST | `/api/auth/login` | ❌ | Public | Login & get JWT token |
| GET | `/api/auth/me` | ✅ | Any | Get current user profile |
| GET | `/api/auth/admin-test` | ✅ | Admin | Admin-only test route |
| GET | `/api/auth/seller-test` | ✅ | Admin/Seller | Seller/Admin test route |

#### 📥 POST `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Pass@123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` — Missing fields / validation error
- `409` — User already exists
- `429` — Too many requests (rate limited)

---

#### 📥 POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Pass@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successfull",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**
- `400` — Missing credentials
- `401` — Invalid email/password
- `429` — Too many login attempts

---

#### 📥 GET `/api/auth/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2025-01-10T10:30:00.000Z",
    "updatedAt": "2025-01-10T10:30:00.000Z"
  }
}
```

---

### 2. Product APIs

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/product` | ✅ | Admin/Seller | Create product |
| GET | `/api/product` | ❌ | Public | Get all active products |
| GET | `/api/product/search?keyword=xyz` | ❌ | Public | Search products |
| GET | `/api/product/filter` | ❌ | Public | Filter products |
| GET | `/api/product/:id` | ❌ | Public | Get single product |
| PUT | `/api/product/:id` | ✅ | Admin/Owner | Update product |
| DELETE | `/api/product/:id` | ✅ | Admin/Owner | Soft-delete product |
| POST | `/api/product/:id/images` | ✅ | Admin/Owner | Upload images (max 5) |
| DELETE | `/api/product/:id/images/:imageId` | ✅ | Admin/Owner | Delete image |
| PATCH | `/api/product/:productId/stock` | ✅ | Admin | Update stock |
| GET | `/api/product/inventory/low-stock` | ✅ | Admin | Get low-stock products |
| GET | `/api/product/inventory/out-of-stock` | ✅ | Admin | Get out-of-stock products |

#### 📥 POST `/api/product` — Create Product

**Headers:**
```
Authorization: Bearer <admin_or_seller_token>
```

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "description": "Latest Apple flagship with A17 Pro chip",
  "price": 129999,
  "discount": 10,
  "category": "Electronics",
  "brand": "Apple",
  "stock": 50
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product create successfully",
  "product": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "iPhone 15 Pro",
    "description": "Latest Apple flagship with A17 Pro chip",
    "price": 129999,
    "discount": 10,
    "category": "Electronics",
    "brand": "Apple",
    "stock": 50,
    "images": [],
    "rating": 0,
    "numReviews": 0,
    "seller": "64f1a2b3c4d5e6f7a8b9c0d2",
    "isActive": true,
    "createdAt": "2025-01-10T10:30:00.000Z",
    "updatedAt": "2025-01-10T10:30:00.000Z"
  }
}
```

---

#### 📥 GET `/api/product` — Get All Products

**Query Parameters:**

| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `sort` | string | `price_asc`, `price_desc`, `rating_desc`, `newest`, `oldest`, `name_asc`, `name_desc` | Sort order (default: `newest`) |

**Example:**
```
GET /api/product?sort=price_asc
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 20,
  "sort": "price_asc",
  "products": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "iPhone 15 Pro",
      "price": 129999,
      "stock": 50,
      "rating": 4.5,
      "images": [{ "url": "https://...", "publicId": "..." }],
      "isActive": true
    }
  ]
}
```

---

#### 📥 GET `/api/product/search` — Search Products

**Query Parameters:**
```
?keyword=iphone
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "products": [...]
}
```

---

#### 📥 GET `/api/product/filter` — Filter Products

**Query Parameters:**

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `category` | string | `Electronics` | Filter by category |
| `brand` | string | `Apple` | Filter by brand |
| `minPrice` | number | `10000` | Minimum price |
| `maxPrice` | number | `150000` | Maximum price |
| `minRating` | number | `4` | Minimum rating |
| `inStock` | string | `true` / `false` | Stock availability |
| `sort` | string | `price_asc` | Sort order |

**Example:**
```
GET /api/product/filter?category=Electronics&minPrice=50000&maxPrice=150000&inStock=true&sort=price_desc
```

---

#### 📥 POST `/api/product/:id/images` — Upload Images

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**

| Key | Type | Value |
|-----|------|-------|
| `images` | File(s) | Max 5 image files, each ≤5MB |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product images uploaded successfully",
  "images": [
    {
      "url": "https://res.cloudinary.com/.../image1.jpg",
      "publicId": "ecommerce/products/abc123"
    }
  ],
  "product": { ... }
}
```

---

#### 📥 PATCH `/api/product/:productId/stock` — Update Stock

**Request Body:**
```json
{
  "stock": 100
}
```

---

### 3. Cart APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/cart` | ✅ | Add product to cart |
| GET | `/api/cart` | ✅ | Get current cart |
| PUT | `/api/cart/:productId` | ✅ | Update quantity |
| DELETE | `/api/cart/:productId` | ✅ | Remove specific item |
| DELETE | `/api/cart` | ✅ | Clear entire cart |

#### 📥 POST `/api/cart` — Add to Cart

**Request Body:**
```json
{
  "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "quantity": 2
}
```

**Success Response (201 or 200):**
```json
{
  "success": true,
  "message": "Product added to cart",
  "cart": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "user": "64f1a2b3c4d5e6f7a8b9c0d2",
    "items": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
        "product": {
          "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
          "name": "iPhone 15 Pro",
          "price": 129999,
          "stock": 50
        },
        "quantity": 2
      }
    ]
  }
}
```

---

#### 📥 GET `/api/cart` — Get Cart

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "stockIssues": [],
  "totals": {
    "subtotal": 259998,
    "discount": 25999.8,
    "total": 233998.2
  }
}
```

---

#### 📥 PUT `/api/cart/:productId` — Update Quantity

**Request Body:**
```json
{
  "quantity": 5
}
```

---

### 4. Order APIs

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/order` | ✅ | Any | Create order from cart (COD) |
| GET | `/api/order/my-orders` | ✅ | Any | Get user's orders |
| GET | `/api/order/:orderId` | ✅ | Owner | Get single order |
| PATCH | `/api/order/:orderId/cancel` | ✅ | Owner | Cancel order (stock restored) |
| GET | `/api/order/admin/all` | ✅ | Admin | Get all orders |
| PATCH | `/api/order/:orderId/status` | ✅ | Admin | Update order status |

#### 📥 POST `/api/order` — Create Order (COD)

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "addressLine": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "postalCode": "560001",
  "country": "India"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "user": "64f1a2b3c4d5e6f7a8b9c0d2",
    "items": [
      {
        "product": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "iPhone 15 Pro",
        "price": 129999,
        "quantity": 2,
        "subtotal": 233998.2
      }
    ],
    "shippingAddress": { ... },
    "subtotal": 259998,
    "discount": 25999.8,
    "total": 233998.2,
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "createdAt": "2025-01-10T10:30:00.000Z"
  }
}
```

---

#### 📥 PATCH `/api/order/:orderId/status` — Update Status (Admin)

**Request Body:**
```json
{
  "orderStatus": "shipped"
}
```

**Allowed statuses:** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**Valid transitions:**
- `pending` → `confirmed`
- `confirmed` → `processing`
- `processing` → `shipped`
- `shipped` → `delivered`

---

### 5. Payment APIs (Razorpay)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payment/create-razorpay-order` | ✅ | Create Razorpay order |
| POST | `/api/payment/verify-razorpay-payment` | ✅ | Verify payment signature |

#### 📥 POST `/api/payment/create-razorpay-order`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "9876543210",
  "addressLine": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "postalCode": "560001",
  "country": "India"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "orderId": "64f1a2b3c4d5e6f7a8b9c0d7",
  "razorpayOrderId": "order_Nxxxxx",
  "amount": 23399820,
  "currency": "INR",
  "keyId": "rzp_test_xxxxxxxxxxxx"
}
```

---

#### 📥 POST `/api/payment/verify-razorpay-payment`

**Request Body:**
```json
{
  "razorpay_order_id": "order_Nxxxxx",
  "razorpay_payment_id": "pay_Nxxxxx",
  "razorpay_signature": "hex_signature_from_razorpay"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and order confirmed successfully",
  "order": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "paymentStatus": "paid",
    "orderStatus": "confirmed",
    "inventoryStatus": "committed",
    "razorpayPaymentId": "pay_Nxxxxx",
    "total": 233998.2
  }
}
```

---

### 6. Review APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/product/:productId/reviews` | ❌ | Get all reviews |
| POST | `/api/product/:productId/reviews` | ✅ | Add review (one per user) |
| PUT | `/api/product/:productId/reviews` | ✅ | Update own review |
| DELETE | `/api/product/:productId/reviews` | ✅ | Delete own review |

#### 📥 POST `/api/product/:productId/reviews` — Add Review

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excellent product! Highly recommend."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Review added successfully",
  "review": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d8",
    "product": "64f1a2b3c4d5e6f7a8b9c0d1",
    "user": "64f1a2b3c4d5e6f7a8b9c0d2",
    "rating": 5,
    "comment": "Excellent product! Highly recommend.",
    "createdAt": "2025-01-10T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` — Invalid rating (must be 1-5) / comment length
- `404` — Product not found
- `409` — Already reviewed this product

---

### 7. Wishlist APIs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wishlist` | ✅ | Get user's wishlist |
| POST | `/api/wishlist/:productId` | ✅ | Add product to wishlist |
| DELETE | `/api/wishlist/:productId` | ✅ | Remove specific product |
| DELETE | `/api/wishlist` | ✅ | Clear entire wishlist |

#### 📥 GET `/api/wishlist`

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "iPhone 15 Pro",
      "price": 129999,
      "stock": 50,
      "isActive": true
    }
  ]
}
```

---

## 🔑 Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

1. REGISTRATION
   POST /api/auth/register
   └── User created with role="user" (default)
   └── Password hashed with bcrypt (10 rounds)

2. LOGIN
   POST /api/auth/login
   └── Returns JWT token (valid for 1 day)
   └── Token payload: { userId, role }
   └── Client stores token (localStorage / memory)

3. AUTHENTICATED REQUESTS
   Headers: { Authorization: "Bearer <token>" }
   └── Middleware `protect` verifies JWT
   └── Sets req.user = { userId, role }

4. ROLE-BASED ACCESS
   └── Middleware `authorize("admin", "seller")` checks role
   └── Returns 403 if role not allowed

5. TOKEN EXPIRY
   └── After 1 day, client must re-login
```

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **user** | Browse products, manage own cart/orders/wishlist/reviews |
| **seller** | All user permissions + CRUD on **own** products + upload images |
| **admin** | Full access: all products, all orders, stock, inventory reports |

### Token Usage in Postman/Swagger

**Postman:**
1. Login → copy `token` from response
2. Add header: `Authorization: Bearer <token>`

**Swagger UI:**
1. Click **Authorize** button (top-right)
2. Enter: `<token>` (without "Bearer")
3. All protected endpoints will include the token automatically

---

## 🧪 Testing

### Postman Collection

Import the collection:
1. Open Postman → **Import**
2. Select **Link** tab
3. Enter: `http://localhost:8000/api-docs.json`
4. Click **Continue** → **Import**

**Testing Flow:**
```
1. Register a user        → POST /api/auth/register
2. Login                  → POST /api/auth/login
3. Copy token from response
4. Set Authorization: Bearer <token>
5. Test protected endpoints
```

### Test Coverage

| Module | Test Cases | Status |
|--------|-----------|--------|
| Auth | 18 | ✅ All Passing |
| Cart | 19 | ✅ All Passing |
| Order | 20 | ⚠️ 1 Known Bug (route ordering) |
| Payment | 6 | ✅ All Passing |
| Product | 33 | ⚠️ 2 Known Bugs (route ordering) |
| Review | 12 | ✅ All Passing |
| Wishlist | 10 | ✅ All Passing |
| **Total** | **118** | **97.5% Pass Rate** |

### Known Issues

| Bug ID | Description | Severity | Status |
|--------|-------------|----------|--------|
| BUG-001 | `/api/order/admin/all` route conflict with `/:orderId` | Critical | Open |
| BUG-002 | `/api/product/inventory/low-stock` route conflict | Critical | Open |
| BUG-003 | `/api/product/inventory/out-of-stock` route conflict | Critical | Open |

> **Fix:** Move static routes **before** dynamic routes in route files.

---

## 📚 Swagger Documentation

Interactive API documentation is available at:

- **Local:** `http://localhost:8000/api-docs`
- **Production:** `https://e-commerce-api-qjeq.onrender.com`

### Features
- ✅ All 37+ endpoints documented
- ✅ Interactive "Try it out" functionality
- ✅ Pre-filled request body examples
- ✅ Response schemas for every endpoint
- ✅ JWT authentication via "Authorize" button
- ✅ Persistent authorization (survives page refresh)

### Raw OpenAPI Spec
```bash
# Download JSON
curl http://localhost:8000/api-docs.json -o swagger.json
```

---

## 🔒 Security Features

| Feature | Implementation | Protection |
|---------|---------------|-----------|
| **Rate Limiting** | express-rate-limit | Brute-force, DDoS |
| **Helmet** | helmet | XSS, clickjacking, MIME sniffing |
| **CORS** | cors with origin whitelist | Unauthorized origins |
| **MongoDB Sanitization** | express-mongo-sanitize | NoSQL injection |
| **XSS Clean** | xss-clean | Cross-site scripting |
| **Body Size Limit** | express.json({ limit: '10kb' }) | Large payload attacks |
| **Password Hashing** | bcrypt (10 rounds) | Password leaks |
| **JWT** | jsonwebtoken (1d expiry) | Session hijacking |
| **Input Validation** | express-validator | Malformed input |
| **Role-Based Access** | Custom middleware | Privilege escalation |

---

## 🚀 Deployment

### Deploy to Render

1. **Create MongoDB Atlas cluster** → copy connection string
2. **Push code to GitHub**
3. **Create Render Web Service:**
   - Connect GitHub repo
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. **Add Environment Variables** (all from `.env`)
5. **Set `NODE_ENV=production`**
6. **Deploy!**

### MongoDB Atlas Setup
- Network Access → Allow `0.0.0.0/0` (all IPs) for Render
- Create database user with read/write permissions
- Copy connection string to `MONGO_URI`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Coding Guidelines
- Follow existing folder structure
- Add JSDoc comments for new APIs
- Update Swagger annotations
- Test endpoints in Postman before PR

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Jafar Ali**

- GitHub: [@your-username](https://github.com/alijafar000)
- LinkedIn: [Your Name](www.linkedin.com/in/jafar-ali-397826293)
- Email: alijafarali000@gmail.com

---

## 🙏 Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Razorpay](https://razorpay.com/)
- [Cloudinary](https://cloudinary.com/)
- [Swagger](https://swagger.io/)

---

## ⭐ Show Your Support

Give a ⭐ if this project helped you!

---

**Built with ❤️ using Node.js & Express**
