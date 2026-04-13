# 🎟️ Book My Ticket (Chai Code Hackathon)

This project is an extension of the starter code provided in the Chai Aur SQL class.
The goal was to implement authentication and a secure seat booking system.

---

## 🚀 Features

* User Registration (with hashed passwords using bcrypt)
* User Login (JWT-based authentication)
* Protected Routes using middleware
* Secure Seat Booking with transaction handling
* Prevent duplicate bookings
* Database-level constraints for data integrity

---

## 🧱 Tech Stack

* Node.js
* Express.js
* PostgreSQL
* JWT (jsonwebtoken)
* bcrypt

---

## 🔐 Authentication Flow

1. User registers via `/register`
2. User logs in via `/login`
3. Server returns a JWT token
4. Token is sent in headers for protected routes

Example:
Authorization: Bearer <token>

---

## 🎬 Booking Flow

1. User sends request to `/book/:id`
2. Middleware verifies JWT
3. Transaction begins
4. Seat is locked using `FOR UPDATE`
5. Check if seat already booked
6. Check duplicate booking in `bookings` table
7. Seat is updated
8. Booking is stored
9. Transaction committed

---

## 🛢️ Database Schema

### Users Table

* id
* name
* email (unique)
* password (hashed)

### Seats Table

* id
* name
* isbooked

### Bookings Table

* id
* user_id (FK)
* seat_id (FK)
* UNIQUE(user_id, seat_id)

---

## ⚙️ Setup Instructions

1. Clone the repo

2. Install dependencies:
   npm install

3. Setup PostgreSQL and create tables

4. Run server:
   node index.mjs

---

## 🧪 API Endpoints

### Register

POST /register

### Login

POST /login

### Get Seats

GET /seats

### Book Seat (Protected)

PUT /book/:id

---

## 🧠 Key Learnings

* Implementing JWT authentication
* Using transactions for consistency
* Preventing race conditions with row locking
* Designing relational database schema

---


