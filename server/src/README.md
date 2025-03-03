# UberEATS Prototype - Server

This is the backend server for the UberEATS prototype application. It provides REST APIs for customer and restaurant management, order processing, and menu management.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. Create a MySQL database:
   ```sql
   CREATE DATABASE ubereats_prototype;
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and other configurations in `.env`

5. Build the TypeScript code:
   ```bash
   npm run build
   ```
   or
   ```bash
   yarn build
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

The server will start on http://localhost:5000

## API Documentation

The API documentation is available at http://localhost:5000/api-docs when the server is running.

## Features

### Customer Features
- User authentication (signup/login)
- Profile management
- Restaurant browsing and searching
- Menu viewing
- Order placement and tracking
- Favorite restaurants management

### Restaurant Features
- Restaurant authentication (signup/login)
- Profile management
- Menu management (add/edit/delete dishes)
- Order management and status updates

## Database Schema

The application uses the following main tables:
- users (for both customers and restaurants)
- dishes
- orders
- order_items
- favorites

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MySQL
- Sequelize ORM
- Express Session
- Swagger/OpenAPI
- bcrypt.js for password hashing 