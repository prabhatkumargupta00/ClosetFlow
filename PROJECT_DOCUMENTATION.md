# Closet Flow - Complete Project Documentation

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Models & Schemas](#database-models--schemas)
5. [Architecture](#architecture)
6. [API Endpoints](#api-endpoints)
7. [Features & Functionality](#features--functionality)
8. [Data Flow](#data-flow)
9. [Setup & Installation](#setup--installation)
10. [Known Issues & Improvements](#known-issues--improvements)
11. [Quick Reference](#quick-reference)

---

## 🎯 Project Overview

**Project Name:** Closet Flow  
**Purpose:** Indian ethnic wear rental platform for managing luxury clothing items (lehengas, sherwanis, suits, etc.)  
**Type:** Full-stack web application  
**Runtime:** Node.js with Express  
**Database:** MongoDB  
**Port:** 8080

### Core Features

- User registration and authentication
- Browse and search ethnic wear listings
- Admin dashboard for inventory management
- Rental status tracking (available, reserved, rented)
- Role-based access control (Admin, User)

---

## 🛠 Technology Stack

### Backend

- **Framework:** Express.js v5.1.0
- **Runtime:** Node.js
- **Database:** MongoDB v8.16.4 (Mongoose ODM)
- **Session Management:** express-session v1.19.0
- **Authentication:** bcrypt v6.0.0 (password hashing)

### Frontend

- **Template Engine:** EJS v3.1.10 with ejs-mate v4.0.0
- **Styling:** Tailwind CSS v4.1.18 (with CLI & PostCSS)
- **CSS Utilities:** Autoprefixer v10.4.24

### Utilities

- **Method Override:** v3.0.0 (for REST tunneling in forms)

### Dev Dependencies

- Tailwind CSS CLI & PostCSS for styling

---

## 📁 Project Structure

```
closet-flow-complete/
├── app.js                          # Main Express application
├── dataa.js                        # (unused file)
├── oldApp.js                       # (deprecated/backup)
├── package.json                    # Dependencies & scripts
├── tailwind.css                    # Tailwind config CSS
├── README.md                       # Project README
│
├── controllers/                    # Business logic handlers
│   ├── admin.controller.js        # Admin actions
│   ├── listings.controller.js     # Listing operations
│   └── user.controller.js         # User auth operations
│
├── models/                         # Mongoose schemas
│   ├── user.model.js              # User schema & password hashing
│   └── listing.model.js           # Listing/clothing item schema
│
├── routes/                         # API route definitions
│   ├── admin.route.js             # Admin routes
│   ├── listings.route.js          # Listing CRUD routes
│   └── user.route.js              # Auth routes
│
├── middlewares/                    # Authentication & validation
│   ├── auth.middleware.js         # isAdmin authorization check
│   ├── isAdmin.middleware.js      # isAdmin authorization (alternate)
│   └── isLoggedIn.middleware.js   # Session verification
│
├── utils/                          # Utility functions
│   └── expressError.js            # Custom error class
│
├── init/                           # Database initialization
│   ├── index.js                   # DB connection & seed script
│   └── data.js                    # Sample listings data
│
├── views/                          # EJS templates
│   ├── layouts/
│   │   └── boilerplate.ejs        # Main layout wrapper
│   ├── includes/
│   │   ├── navbar.ejs             # Navigation bar
│   │   └── footer.ejs             # Footer component
│   ├── listings/
│   │   ├── index.ejs              # All listings view
│   │   ├── show.ejs               # Single listing view
│   │   ├── new.ejs                # Create listing form
│   │   └── edit.ejs               # Edit listing form
│   ├── admin/
│   │   ├── dashboard.ejs          # Admin stats dashboard
│   │   └── listings.ejs           # Admin listings management
│   ├── users/
│   │   ├── login.ejs              # Login form
│   │   └── register.ejs           # Registration form
│   └── error/
│       └── error.ejs              # Error display page
│
├── public/                         # Static assets
│   ├── style.css                  # Custom styles
│   ├── tailwind.css               # Compiled Tailwind CSS
│   └── assets/                    # Images, fonts, etc.
│
└── node_modules/                  # Installed packages
```

---

## 💾 Database Models & Schemas

### 1. User Model

**File:** `models/user.model.js`

```javascript
{
    username: String (required, trimmed),
  email: String (required, unique, lowercase, trimmed),
  password: String (required, hashed with bcrypt),
  role: Enum['admin', 'user'] (default: 'user'),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Key Features:**

- Password automatically hashed before save using bcrypt (salt: 12)
- Email must be unique
- Timestamps track creation and updates

**Methods/Hooks:**

- `pre("save")` hook: Hashes password if modified

---

### 2. Listing Model

**File:** `models/listing.model.js`

```javascript
{
  title: String (required, trimmed),
  description: String (required, trimmed, length: 10-200),
  image: String (default: fallback URL),
  pricePerDay: Number (required, min: 0),
  location: String (required, trimmed),
  brand: String (trimmed, max: 60 chars),
  color: String (trimmed, max: 30 chars),

  category: Enum[
    'Lehenga',
    'Kurta Pajama',
    'Sherwani',
    'Anarkali',
    'Suit',
    'Bandhgala'
  ] (required),

  occasion: Enum[
    'Wedding',
    'Reception',
    'Festive',
    'Corporate',
    'Formal'
  ] (required),

  size: Array of Enum['S', 'M', 'L', 'XL'] (required, at least 1),
  fitType: Enum['Slim', 'Regular', 'Relaxed'] (default: 'Regular'),
  rentalStatus: Enum['available', 'reserved', 'rented'] (default: 'available'),
  rating: Number (min: 0, max: 5, default: 0),

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Key Features:**

- Text index on `title` and `description` for search optimization
- Multiple size support (array of sizes available)
- Rental status tracking for inventory management
- 7 sample listings provided in `init/data.js`

---

## 🏗 Architecture

### Middleware Stack (in `app.js`)

```
Request
  ↓
Express Middleware (body-parser)
  ↓
Method Override (PUT/DELETE tunneling)
  ↓
Static Files Serving
  ↓
Session Middleware (express-session)
  ↓
res.locals (currentUser, currentUserRole)
  ↓
Routes
  ↓
404 Handler
  ↓
Error Handler
  ↓
Response
```

### Authentication & Authorization Middlewares

#### `isLoggedIn` Middleware

- Checks if `req.session.userId` exists
- Redirects unauthenticated users to `/login`
- Used for: Create, Edit, Delete listings; Rental flow

#### `isAdmin` Middleware

- Verifies both login status AND role = 'admin'
- Different implementations exist:
    - `auth.middleware.js`: Returns 403 Forbidden
    - `isAdmin.middleware.js`: Redirects to login
- Used for: Admin dashboard, inventory management

**⚠️ Issue:** Inconsistent implementations can cause unexpected behavior. Recommend standardizing to one.

---

## 🔌 API Endpoints

### Public Routes (No Auth Required)

| Method | Route           | Handler               | Description                              |
| ------ | --------------- | --------------------- | ---------------------------------------- |
| GET    | `/`             | -                     | Redirects to `/listings`                 |
| GET    | `/listings`     | `listings.index`      | List all listings (optional `?q=search`) |
| GET    | `/listings/:id` | -                     | View single listing details              |
| GET    | `/login`        | `user.renderLogin`    | Display login form                       |
| GET    | `/register`     | `user.renderRegister` | Display registration form                |
| POST   | `/login`        | `user.login`          | Authenticate user                        |
| POST   | `/register`     | `user.register`       | Create new user account                  |

### Authenticated User Routes (Login Required)

| Method | Route                | Handler       | Description                   |
| ------ | -------------------- | ------------- | ----------------------------- |
| POST   | `/logout`            | `user.logout` | Destroy session               |
| POST   | `/listings/:id/rent` | -             | Initiate rental (placeholder) |

### Admin-Only Routes (Admin Login Required)

| Method | Route                        | Handler                    | Description               |
| ------ | ---------------------------- | -------------------------- | ------------------------- |
| GET    | `/listings/new`              | -                          | Show create listing form  |
| POST   | `/listings`                  | -                          | Create new listing        |
| GET    | `/listings/:id/edit`         | -                          | Show edit listing form    |
| PUT    | `/listings/:id`              | -                          | Update listing details    |
| DELETE | `/listings/:id`              | -                          | Delete listing            |
| GET    | `/admin/dashboard`           | `admin.renderDashboard`    | View admin stats          |
| GET    | `/admin/listings`            | `admin.renderAllListings`  | View all listings (admin) |
| PATCH  | `/admin/listings/:id/status` | `admin.updateRentalStatus` | Change rental status      |

---

## ⚙️ Features & Functionality

### 1. User Management

#### Registration

- Create account with username, email, password
- Password hashed with bcrypt (12 rounds)
- Duplicate email detection & error handling
- Auto-login after registration
- Role defaults to "user"

#### Authentication

- Email & password login
- Session-based auth (express-session)
- Session stores: userId, role
- Logout clears session

#### Authorization

- `currentUser` and `currentUserRole` available in all views via `res.locals`
- Two-tier access: User vs Admin

---

### 2. Listing Management

#### Viewing Listings

- **Browse all:** GET `/listings`
- **Search:** GET `/listings?q=keyword` (regex search on title & description)
- **View details:** GET `/listings/:id`

#### Creating/Editing (Admin Only)

- Create form: `/listings/new`
- Validate: At least one size must be selected
- Required fields: title, description, price, location, category, occasion, size
- Optional fields: brand, color, image, fitType

#### Deleting (Admin Only)

- Remove listing via DELETE `/listings/:id`

#### Rental Status Management (Admin Only)

- Update status: PATCH `/admin/listings/:id/status`
- Valid statuses: `available`, `reserved`, `rented`

---

### 3. Admin Dashboard

#### Dashboard Features

- **Total Listings:** Count of all items
- **Availability Breakdown:** Available / Reserved / Rented counts
- **User Stats:** Total users, admin count
- Location: `/admin/dashboard`

#### Inventory View

- View all listings in a table format
- Update rental status individually
- Location: `/admin/listings`

---

### 4. Search Functionality

- **Location:** `/listings?q=keyword`
- **Method:** Case-insensitive regex on title and description
- **Database Index:** Text index on title & description fields
- **Note:** Works well for small datasets; consider MongoDB full-text search for scale

---

## 🔄 Data Flow

### Registration Flow

```
User fills registration form
  ↓
POST /register
  ↓
user.controller.register()
  ↓
Create User instance
  ↓
user.model.js pre-save hook
  ↓
bcrypt.hash(password)
  ↓
Save to MongoDB
  ↓
Set session: userId, role
  ↓
Redirect to /listings
```

### Login Flow

```
User submits email + password
  ↓
POST /login
  ↓
user.controller.login()
  ↓
Find user by email
  ↓
bcrypt.compare(password, hashedPassword)
  ↓
If valid: Set session (userId, role)
         Redirect to /listings
  ↓
If invalid: Redirect to /login
```

### Create Listing Flow (Admin)

```
Admin clicks "New Listing"
  ↓
Middleware: isLoggedIn + isAdmin
  ↓
User routed to /listings/new
  ↓
Admin fills form & submits
  ↓
POST /listings
  ↓
Validate: At least one size selected
  ↓
Create Listing instance
  ↓
Save to MongoDB
  ↓
Redirect to /listings/:id
```

### Search Flow

```
User enters search term
  ↓
GET /listings?q=keyword
  ↓
listings.controller.index()
  ↓
Query: Find listings where title OR description matches keyword (regex)
  ↓
Render /listings/index with results
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js:** v14 or higher
- **npm:** v6 or higher
- **MongoDB:** Running locally on `mongodb://127.0.0.1:27017` (or customize in `app.js`)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build Tailwind CSS (Optional)

For one-time build:

```bash
npm run build:css
```

For development with watch mode:

```bash
npm run watch:css
```

### Step 3: Start MongoDB

Ensure MongoDB is running on your local machine:

```bash
mongod
```

(Windows users can use MongoDB Compass or install as a service)

### Step 4: Initialize Database (Optional)

**Note:** Fix the import path in `init/index.js` first (see Known Issues).

To seed sample data:

```bash
node init/index.js
```

### Step 5: Start Server

```bash
node app.js
```

**Output:**

```
Connected to database
server is listening to port 8080
```

### Step 6: Access Application

Open browser and navigate to:

```
http://localhost:8080
```

---

## ⚠️ Known Issues & Improvements

### Critical Issues

#### 1. **Incorrect Import Path in `init/index.js`**

- **Current:** `require("../models/listing.js")`
- **Should be:** `require("../models/listing.model.js")`
- **Impact:** Init script will fail
- **Fix:** Update import path

#### 2. **Duplicate & Inconsistent `isAdmin` Middleware**

- **Problem:** Two different implementations of `isAdmin`:
    - `auth.middleware.js` → returns 403 Forbidden
    - `isAdmin.middleware.js` → redirects to /login
- **Routes use both inconsistently**
- **Fix:** Standardize to one implementation and export from single file

#### 3. **Hardcoded Secrets & Database URL**

- **Locations:** `app.js`, `init/index.js`
- **Security risk:** Exposed in version control
- **Fix:** Move to `.env` file using `dotenv`

### High Priority Improvements

#### 4. **Session Storage**

- **Current:** In-memory (loses data on restart, not production-safe)
- **Recommendation:** Use `connect-mongo` for persistent session storage
- **Cookie security:** Add `secure: true`, `httpOnly: true`, `sameSite: 'Strict'`

#### 5. **Input Validation**

- **Current:** Minimal server-side validation
- **Add:** Use Joi or express-validator for comprehensive validation
- **Examples:** Email format, password strength, field lengths

#### 6. **Error Handling**

- **Current:** Some routes use try/catch, others don't
- **Issue:** Unhandled promise rejections may crash
- **Fix:** Wrap all async routes in error handler middleware

#### 7. **Rental Flow** (Placeholder)

- **Current:** `POST /listings/:id/rent` returns simple text
- **Implement:**
    - Booking/reservation system
    - Payment integration
    - Delivery tracking
    - User rental history

#### 8. **Missing Features**

- No image upload handling (uses external URLs)
- No user profile/dashboard
- No booking history
- No reviews/ratings system
- No admin user management

### Medium Priority Improvements

#### 9. **Rate Limiting & CSRF Protection**

- Add `csurf` for CSRF protection
- Add rate limiting for auth endpoints (prevent brute force)

#### 10. **Logging & Monitoring**

- Add structured logging (Winston or Pino)
- Better error messages in views

#### 11. **Database Relations**

- Add `owner` reference in Listing to User (link items to sellers)
- Enable booking/rental records linking users to listings

#### 12. **Testing**

- Add unit tests for controllers
- Add integration tests for API routes
- Add end-to-end tests with Playwright/Cypress

---

## 📚 Quick Reference

### npm Scripts

```bash
npm run build:css      # Build Tailwind CSS once
npm run watch:css      # Watch and rebuild Tailwind CSS
npm start              # (Not configured - use: node app.js)
```

### Environment Variables (To Implement)

```env
MONGO_URL=mongodb://127.0.0.1:27017/wanderLust
SESSION_SECRET=closetflowsecret
PORT=8080
NODE_ENV=development
```

### Database Connection

- **URL:** `mongodb://127.0.0.1:27017/wanderLust`
- **ORM:** Mongoose
- **Collections:** `users`, `listings`

### Default Sample Data

- 7 pre-configured listings (Indian ethnic wear)
- Categories: Lehenga, Kurta Pajama, Sherwani, Anarkali, Suit, Bandhgala
- Occasions: Wedding, Reception, Festive, Corporate, Formal
- Sizes: S, M, L, XL
- Price Range: ₹1200 - ₹2500/day

### Session Configuration

```javascript
secret: "closetflowsecret";
resave: false;
saveUninitialized: false;
```

### Key Validation Rules

- **User Email:** Unique, lowercase
- **Listing Title:** Required, trimmed
- **Listing Description:** 10-200 characters
- **Listing Sizes:** At least 1 required
- **Price:** Minimum ₹0
- **Rating:** 0-5 scale

### Response Locals Available in Views

- `currentUser` → User ID (from session)
- `currentUserRole` → 'admin' or 'user'

---

## 🔐 Security Checklist (Not Yet Implemented)

- [ ] Use `.env` for secrets
- [ ] Add HTTPS/secure cookie flags
- [ ] Implement CSRF protection
- [ ] Add rate limiting on auth routes
- [ ] Validate input with Joi/validator
- [ ] Use persistent session store (connect-mongo)
- [ ] Add request logging
- [ ] Enable helmet.js for security headers
- [ ] Add content security policy (CSP)

---

## 📞 Support Reference

If you need to modify this project, key files are:

| Need               | File                                 |
| ------------------ | ------------------------------------ |
| Add new route      | `routes/*.route.js`                  |
| Add business logic | `controllers/*.controller.js`        |
| Add/modify schema  | `models/*.model.js`                  |
| Add middleware     | `middlewares/*.middleware.js`        |
| Modify templates   | `views/**/*.ejs`                     |
| Configure styles   | `tailwind.css` or `public/style.css` |
| Add sample data    | `init/data.js`                       |

---

**Last Updated:** February 9, 2026  
**Project Version:** 1.0.0  
**Status:** Development (MVP - functional, needs polish for production)
