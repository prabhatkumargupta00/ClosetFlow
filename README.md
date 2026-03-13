# Closet Flow

<p align="center">
    <img src="https://img.shields.io/badge/Status-Live-22c55e?style=for-the-badge&logo=vercel&logoColor=white" alt="Live" />
    <img src="https://img.shields.io/badge/Node.js-Express-1f2937?style=for-the-badge&logo=node.js&logoColor=6ee7b7" alt="Node Express" />
    <img src="https://img.shields.io/badge/Database-MongoDB-14532d?style=for-the-badge&logo=mongodb&logoColor=86efac" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Templating-EJS-7c2d12?style=for-the-badge&logo=ejs&logoColor=fcd34d" alt="EJS" />
    <img src="https://img.shields.io/badge/Styling-Tailwind-0f172a?style=for-the-badge&logo=tailwindcss&logoColor=67e8f9" alt="Tailwind" />
</p>

<p align="center">
    <b>Rent. Style. Return.</b><br/>
    A modern outfit rental platform with secure auth, admin controls, and seamless booking flows.
</p>

Closet Flow is a full-stack outfit rental platform where users can browse fashion listings, rent items for a date range, complete rentals, and leave reviews after return.

## Live Project

<p>
    <a href="https://closetflow-dxta.onrender.com/"><img src="https://img.shields.io/badge/Visit%20Closet%20Flow-0ea5e9?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Visit Closet Flow" /></a>
</p>

<blockquote>
    <b>Live URL:</b> https://closetflow-dxta.onrender.com/
</blockquote>

## Project Overview

Closet Flow connects renters with curated outfit listings. The platform supports role-based access:

- Users can register, log in, rent available listings, track their rental history, complete rentals, and review outfits they have actually rented.
- Admins can create and manage listings, monitor rental activity, and complete rentals from the admin panel.

The app includes secure sessions, request rate limiting, Helmet security headers, server-side validation, and cloud image storage.

## Tech Stack

### Backend

- <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
- <img src="https://img.shields.io/badge/Express.js-111827?style=flat-square&logo=express&logoColor=white" alt="Express.js" />
- <img src="https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white" alt="Mongoose" />
- <img src="https://img.shields.io/badge/Joi-0f766e?style=flat-square&logo=checkmarx&logoColor=white" alt="Joi validation" />

### Frontend

- <img src="https://img.shields.io/badge/EJS%20%2B%20ejs--mate-9a3412?style=flat-square&logo=ejs&logoColor=white" alt="EJS templates" />
- <img src="https://img.shields.io/badge/Tailwind%20CSS-0891b2?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
- <img src="https://img.shields.io/badge/Custom%20CSS-1d4ed8?style=flat-square&logo=css3&logoColor=white" alt="Custom CSS" />

### Database and Storage

- <img src="https://img.shields.io/badge/MongoDB%20Atlas-166534?style=flat-square&logo=mongodb&logoColor=86efac" alt="MongoDB Atlas" />
- <img src="https://img.shields.io/badge/ImageKit-312e81?style=flat-square&logo=icloud&logoColor=c4b5fd" alt="ImageKit" />

### Authentication and Security

- <img src="https://img.shields.io/badge/express--session%20%2B%20connect--mongo-0f172a?style=flat-square&logo=auth0&logoColor=white" alt="Session auth" />
- <img src="https://img.shields.io/badge/bcrypt-6b21a8?style=flat-square&logo=letsencrypt&logoColor=white" alt="bcrypt" />
- <img src="https://img.shields.io/badge/Helmet%20CSP-7c2d12?style=flat-square&logo=shield&logoColor=white" alt="Helmet" />
- <img src="https://img.shields.io/badge/Rate%20Limit-047857?style=flat-square&logo=speedtest&logoColor=white" alt="Rate limit" />

## Core Functionality

- User registration and login with session-based auth
- Role-based authorization for admin-only actions
- Outfit listing browsing with:
    - Full-text search
    - Category filters
    - Sorting (newest, oldest, price low to high, price high to low)
    - Pagination
- Listing creation and updates with image uploads
- Rental booking flow with date and size validation
- Rental completion flow for both users and admins
- Review system restricted to completed renters only
- Automatic listing availability changes based on rental state
- Profile page with rental analytics (active/completed rentals and spend)

## User Functionality

- Create account and log in
- Browse all available listings
- Open listing detail pages with reviews and rental context
- Rent an outfit by selecting:
    - Start date
    - End date
    - Available size
- Track personal rentals from "My Rentals"
- Mark own rentals as completed when returned
- Add one review per completed rental
- View personal profile stats and recent rentals

## Admin Functionality

- Access admin dashboard with platform stats:
    - Total listings
    - Available vs rented inventory
    - Total users
    - Total admin users
- Create new listings with image uploads
- Edit listing data and replace listing images
- Delete listings (blocked when active rentals exist)
- View and manage all rentals
- Mark rentals as completed from admin panel
- Update listing rental status from admin listings panel

## Walkthrough

### 1. Landing and Authentication

1. Open the app from the live link or local server.
2. Register a new account or log in.
3. After login, users are redirected based on role:
    - Admin -> admin dashboard
    - Standard user -> listings page

### 2. Browse and Explore Listings

1. Open Listings page.
2. Use search, category filter, sorting, and pagination.
3. Open a listing detail page to view complete item info and reviews.

### 3. Rent an Outfit (User Flow)

1. Open a listing and start rental.
2. Select rental dates and size.
3. Submit the rental form.
4. System validates:
    - Dates are valid
    - Listing is available
    - User is not renting own listing
    - Selected size exists
5. Listing status changes to rented.

### 4. Complete Rental and Review

1. User completes rental from My Rentals page.
2. Listing returns to available state.
3. User can leave a single review only after completed rental.

### 5. Admin Operations

1. Admin logs in and opens dashboard.
2. Admin creates/updates/removes listings.
3. Admin monitors all rentals and completes returns when needed.
4. Admin can update listing rental status from admin listings page.

## Folder Structure

- app.js - main Express app setup (security, sessions, routing)
- controllers/ - route handlers and business logic
- models/ - Mongoose schemas
- routes/ - route modules by domain
- middlewares/ - auth and upload middleware
- validators/ - Joi schemas and validation wrapper
- utils/ - storage and custom error utilities
- views/ - EJS templates (user, listing, rental, admin)
- public/ - static assets and generated Tailwind CSS
- init/ - seed/bootstrap data scripts


![Made by Prabhat](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%20by-Prabhat%20Kumar%20Gupta-blue?style=for-the-badge)