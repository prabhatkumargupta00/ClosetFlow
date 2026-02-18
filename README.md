# Closet Flow

A web application for renting closet spaces or items, built with Node.js, Express, MongoDB, and EJS.

## Description

Closet Flow is a platform that allows users to list and rent out closet spaces or items. Whether you're looking to declutter by renting out unused space or need extra storage, this app connects renters and owners seamlessly. Features include user authentication, listing management, rental tracking, and an admin dashboard for oversight.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templating engine, Tailwind CSS
- **Authentication**: bcrypt, express-session
- **File Uploads**: Multer, ImageKit
- **Other**: method-override for HTTP methods

## Features

- User registration and login
- Create, edit, and view closet listings
- Rent items or spaces with forms
- Admin dashboard for managing users, listings, and rentals
- Image uploads and storage via ImageKit
- Responsive design with Tailwind CSS

## Routes

- **User Routes** (`/users`):
  - GET `/register` - Registration form
  - POST `/register` - Register user
  - GET `/login` - Login form
  - POST `/login` - Login user
  - POST `/logout` - Logout user

- **Listing Routes** (`/listings`):
  - GET `/` - View all listings
  - GET `/new` - New listing form
  - POST `/` - Create listing
  - GET `/:id` - Show listing
  - GET `/:id/edit` - Edit listing form
  - PUT `/:id` - Update listing
  - DELETE `/:id` - Delete listing

- **Rental Routes** (`/rentals`):
  - GET `/` - View rentals
  - POST `/:id` - Rent an item/space

- **Admin Routes** (`/admin`):
  - GET `/dashboard` - Admin dashboard
  - GET `/listings` - Manage listings
  - GET `/rentals` - Manage rentals

## Project Structure

- `controllers/` - Route handlers
- `models/` - Mongoose schemas
- `routes/` - Express routes
- `views/` - EJS templates
- `middlewares/` - Auth and upload middlewares
- `utils/` - Error handling and storage
- `public/` - Static assets


