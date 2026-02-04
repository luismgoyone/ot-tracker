# OT Tracker

A full-stack overtime tracking application built with React, TypeScript, NestJS, and PostgreSQL.

## Features

### For Employees (Regular Users)
- Submit overtime requests with detailed information
- View personal OT history and status
- Track approved hours and monthly summaries
- Real-time status updates (Pending, Approved, Rejected)

### For Supervisors
- Comprehensive dashboard with analytics and metrics
- Approve/reject overtime requests
- View department-wise OT statistics
- Monthly and trend analysis
- Top OT users tracking
- Department performance metrics

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **Zustand** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Day.js** for date manipulation
- **Vite** for build tooling

### Backend
- **NestJS** framework with TypeScript
- **PostgreSQL** database
- **TypeORM** for database operations
- **JWT** authentication
- **Passport** for auth strategies
- **Bcrypt** for password hashing

### DevOps
- **Docker** and **Docker Compose**
- **Nginx** for frontend serving
- Database initialization scripts

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd ot-tracker
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Option 2: Manual Setup

#### Database Setup
1. Create PostgreSQL database named `ot_tracker`
2. Run the initialization script:
```bash
psql -U postgres -d ot_tracker -f database/init.sql
```

#### Backend Setup
```bash
cd backend
npm install
cp ../.env.example .env
# Update database connection in .env file
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Demo Credentials

### Supervisor Account
- **Email:** supervisor@company.com
- **Password:** password123

### Employee Account
- **Email:** employee@company.com
- **Password:** password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/profile` - Get current user profile

### OT Records
- `GET /api/ot-records` - Get all OT records (Supervisor only)
- `GET /api/ot-records/my-records` - Get user's OT records
- `POST /api/ot-records` - Create new OT record
- `PATCH /api/ot-records/:id/status` - Update OT record status (Supervisor only)

### Analytics (Supervisor Only)
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/by-department` - Department-wise statistics
- `GET /api/analytics/monthly` - Monthly OT statistics
- `GET /api/analytics/top-users` - Top OT users
- `GET /api/analytics/trends` - OT trends over time

### Users & Departments
- `GET /api/users` - Get all users (Supervisor only)
- `GET /api/departments` - Get all departments

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password
- `firstName`, `lastName` - User name
- `role` - 'regular' or 'supervisor'
- `departmentId` - Foreign key to departments

### Departments Table
- `id` - Primary key
- `name` - Department name
- `description` - Optional description

### OT Records Table
- `id` - Primary key
- `userId` - Foreign key to users
- `date` - OT date
- `startTime`, `endTime` - Time period
- `duration` - Calculated hours
- `reason` - Reason for overtime
- `status` - 'pending', 'approved', or 'rejected'
- `approvedBy` - Supervisor who approved (if applicable)
- `comments` - Optional comments

## Development

### Backend Development
```bash
cd backend
npm run start:dev  # Development mode with hot reload
npm run test       # Run tests
npm run lint       # Run ESLint
```

### Frontend Development
```bash
cd frontend
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Run ESLint
```

### Database Migrations
```bash
cd backend
npm run migration:generate -- -n MigrationName
npm run migration:run
```

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Environment variable protection

## Performance Optimizations

- Database indexing on frequently queried columns
- API response caching
- Frontend code splitting
- Optimized bundle sizes
- Efficient state management

## Deployment

### Environment Variables
Set the following environment variables for production:

```env
# Backend
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=ot_tracker
DATABASE_USER=your-db-user
DATABASE_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-api-domain.com
```

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the repository or contact the development team.
