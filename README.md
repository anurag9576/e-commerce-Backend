# Authentication Backend

A Node.js/Express backend with MongoDB for user authentication using JWT tokens.

## Features

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Password Hashing with bcryptjs
- MongoDB Database Integration

## Project Structure

```
├── src/
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/
│   │   └── User.js              # User schema
│   ├── controllers/
│   │   └── authController.js    # Login & Register logic
│   ├── routes/
│   │   └── authRoutes.js        # Auth APIs
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verify
│   ├── app.js                   # Express app setup
│   └── server.js                # Server start
├── .env                         # Environment variables
├── package.json
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   FRONTEND_URL=http://localhost:3000
   ```

## Usage

### Start the server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on port 5000 (or the port specified in your `.env` file).

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/profile` - Get user profile (protected)
  - Requires `Authorization: Bearer <token>` header

### Health Check

- `GET /health` - Server health check

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Request validation
- Security headers with helmet
- CORS configuration
- Input sanitization

## Development

### Running in Development Mode

Use nodemon for automatic restarts:
```bash
npm run dev
```

### Environment Variables

Make sure to set up your `.env` file with the correct values before running the application.

## License

MIT
