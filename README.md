# Your Glass Installer 🪟

A specialized web platform connecting homeowners with professional glass installation services. Built with React.js and Node.js, featuring a modern glass-effect UI design.

## ✨ Features

### 🏠 Homeowner Features
- **User Registration & Authentication**: Secure signup/login with JWT tokens
- **Profile Management**: Complete profile setup with contact and address information
- **Job Posting**: Create detailed job posts for glass installation projects
- **Project Management**: Track job status, manage multiple projects
- **Photo Uploads**: Add project photos to help installers understand requirements

### 🔍 Discovery & Search
- **Service Categories**: Browse by type (Kitchen Splashbacks, Shower Screens, Balustrades, etc.)
- **Advanced Filtering**: Search by location, category, budget, and timeline
- **Job Browsing**: View all available projects with detailed information
- **Responsive Design**: Mobile-first approach for all devices

### 🎨 Modern UI/UX
- **Glass Effect Design**: Beautiful backdrop blur and transparency effects
- **Gradient Themes**: Blue to purple color schemes throughout
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Tailwind CSS**: Utility-first CSS framework for consistent styling

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js framework
- **PostgreSQL** (Neon database) for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **CORS** and **Helmet** for security

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for HTTP requests
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **React Hook Form** for form management

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (Neon recommended)
- npm or yarn package manager

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd your-glass-installer
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Database Setup
1. Create a Neon PostgreSQL database
2. Run the schema file:
```bash
psql -h <your-neon-host> -U <username> -d <database> -f server/database/schema.sql
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=5000
```

### 5. Start the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run server    # Backend only
npm run client    # Frontend only
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get user profile

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/user/:userId` - Get jobs by user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID

## 🗄️ Database Schema

### Users Table
- User authentication and profile information
- Address and contact details
- Account verification status

### Categories Table
- Glass installation service types
- Pre-populated with common services

### Jobs Table
- Project details and requirements
- Budget ranges and timelines
- Status tracking and image storage

### Reviews Table
- Future implementation for tradespeople ratings
- Job completion feedback

## 🎯 Project Structure

```
your-glass-installer/
├── server/                 # Backend code
│   ├── database/          # Database schema
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   └── index.js          # Main server file
├── client/                # Frontend React app
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Auth context
│   │   └── App.js        # Main app component
│   └── package.json
├── package.json           # Backend dependencies
└── README.md
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables
2. Build the application
3. Deploy to your preferred hosting service (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Protected routes for authenticated users

## 🎨 Customization

### Styling
- Modify `client/tailwind.config.js` for theme changes
- Update color schemes in `client/src/index.css`
- Customize glass effects and animations

### Features
- Add new service categories in the database
- Implement additional job statuses
- Extend user profile fields

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🚧 Future Enhancements

- **Tradespeople Integration**: Complete installer onboarding and management
- **Quote System**: Allow installers to submit quotes for jobs
- **Messaging System**: In-app communication between parties
- **Payment Processing**: Secure payment handling
- **Review System**: Rating and feedback for completed work
- **Mobile App**: React Native mobile application
- **Advanced Search**: Geolocation-based installer matching
- **Insurance Verification**: Automated tradespeople verification

---

**Your Glass Installer** - Transforming homes with professional glass installation services! 🪟✨
