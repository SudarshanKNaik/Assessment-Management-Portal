# Internal Assessment Portal

A web application for managing internal assessment marks for faculty and students, built with React and MongoDB.

## Features

1. **Home Page with Login**
   - Login for both faculty and students
   - Form validation
   - Role-based authentication

2. **Faculty Features**
   - Upload and update student marks
   - View all student marks by course
   - View class statistics including:
     - Class average
     - Number of S, A, B, C, D, and F grades
   - Support for three courses (25ECSC301, 24ECSP304, 24ECSC303)

3. **Student Features**
   - View only their own marks
   - See marks for all three courses
   - View grade and assessment details

## Technology Stack

- **Frontend**: React 18
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Installation

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/internal-assessment
   JWT_SECRET=your-secret-key-change-in-production
   ```

3. **Start MongoDB**:
   Make sure MongoDB is running on your system. If using a local installation:
   ```bash
   mongod
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 5000) and the React frontend (port 3000).

## Default Users

You can create users through the registration endpoint or directly in MongoDB. Here are some example users you might want to create:

### Faculty User
- Username: `faculty1`
- Password: `password123`
- Role: `faculty`

### Student User
- Username: `student1`
- Password: `password123`
- Role: `student`
- Student ID: `STU001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Marks (Faculty Only)
- `GET /api/marks/all?courseCode=25ECSC301` - Get all marks for a course
- `POST /api/marks/upload` - Upload new marks
- `PUT /api/marks/update/:id` - Update existing marks
- `DELETE /api/marks/delete/:id` - Delete marks

### Marks (Student)
- `GET /api/marks/my-marks` - Get student's own marks

### Statistics (Faculty Only)
- `GET /api/statistics/all` - Get statistics for all courses
- `GET /api/statistics/course/:courseCode` - Get statistics for a specific course

## Grade System

- **S**: 90-100
- **A**: 80-89
- **B**: 70-79
- **C**: 60-69
- **D**: 50-59
- **F**: Below 50

## Course Codes

- 25ECSC301 - Software Engineering
- 24ECSP304 - Web Technologies Lab
- 24ECSC303 - Computer Networks

## Project Structure

```
.
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── index.js
├── package.json
└── README.md
```

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- The frontend is configured to proxy API requests to the backend

## Security Notes

- Change the JWT_SECRET in production
- Use environment variables for sensitive data
- Implement rate limiting in production
- Use HTTPS in production
- Add input sanitization for production use

