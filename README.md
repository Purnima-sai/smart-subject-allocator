# Smart Subject Allocation & Elective Management System (SSAEMS)

A comprehensive web application for managing elective course allocation in educational institutions with role-based access for admins, faculty, and students.

## Features

### Admin Dashboard
- **Subject Management**: Add, edit, delete subjects with year and semester filtering
- **Allocation Algorithm**: Upload CSV/Excel files for automated allocation
- **System Settings**: Configure allocation rules and system parameters
- **Reports & Analytics**: Generate comprehensive reports and visualizations

### Faculty Dashboard
- **Course Management**: View and manage assigned courses
- **Student Tracking**: Monitor student enrollments and performance

### Student Dashboard
- **Elective Preferences**: Submit ranked preferences for elective courses
- **Allotted Courses**: View allocated courses with year/semester information
- **Change Requests**: Request course changes with justification

## Tech Stack

### Frontend
- **React 18.2.0** - UI library
- **Material-UI v5** - Component library
- **React Router v7** - Navigation
- **Chart.js & Nivo** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js & Express** - Server framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Project Structure

```
SSAEMS/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   └── App.js        # Main app component
│   └── package.json
│
└── backend/           # Node.js backend API
    ├── models/        # Database models
    ├── routes/        # API routes
    ├── middleware/    # Custom middleware
    ├── scripts/       # Utility scripts
    └── server.js      # Express server
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ssaems
JWT_SECRET=your_jwt_secret_key_here
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. The proxy is already configured in `package.json` to point to the backend

4. Start the frontend:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Test Credentials

### Admin
- Email: `admin@example.com`
- Password: `admin123`

### Student
- Email: `student@example.com`
- Password: `student123`

## Key Features Implementation

### Role-Based Authentication
- JWT-based authentication with secure password hashing
- Role verification middleware for protected routes
- Conditional navigation based on user role

### Subject Management with Year/Semester Filtering
- Admins can assign subjects to specific years (1-4) and semesters (1-2)
- Students see only subjects relevant to their academic level
- Real-time updates across all connected sessions

### File Upload for Allocation
- CSV/Excel upload support for bulk student allocation
- Validation and parsing of uploaded files
- Error handling for invalid data

### Real-Time Updates
- Custom events for cross-component communication
- Storage events for cross-tab synchronization
- Automatic refresh of subject lists when admins make changes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Subjects (Protected)
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create new subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Students (Protected)
- `GET /api/students` - Get all students
- `POST /api/students/preferences` - Submit preferences

## Development

### Running Both Servers
You can run both frontend and backend simultaneously:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Authors

- Purnima Sai

## Acknowledgments

- Material-UI for the component library
- Chart.js and Nivo for visualization components
- The React and Node.js communities
