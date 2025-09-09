# HRMS Platform - UPTIQ Internship Project

A comprehensive Human Resource Management System built with microservices architecture for the UPTIQ Fresher Onboarding Program Week 3 project.

## 🏗️ Architecture Overview

This HRMS platform demonstrates production-ready engineering practices with:

- **Employee Service**: Handles employee CRUD operations, profiles, and JWT authentication
- **HR Operations Service**: Manages leave requests, attendance tracking, and payroll
- **Frontend**: React TypeScript dashboard with modern UI/UX
- **Databases**: PostgreSQL with Prisma ORM + MongoDB for operations data
- **Containerization**: Full Docker orchestration with docker-compose

## 🛠️ Tech Stack

### Backend Services
- **Node.js + Express.js + TypeScript**
- **Prisma ORM** for PostgreSQL (Employee Service)
- **Mongoose** for MongoDB (HR Operations Service)
- **JWT Authentication** with bcrypt password hashing
- **Zod Validation** for request validation
- **Winston Logging** with centralized error handling
- **Swagger/OpenAPI** documentation

### Frontend
- **React 18 + TypeScript**
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hook Form** with Zod validation
- **Context API** for state management

### DevOps & Infrastructure
- **Docker + Docker Compose** for containerization
- **PostgreSQL** database for employee data
- **MongoDB** database for HR operations
- **Nginx** reverse proxy
- **Health checks** and service discovery

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hrms-platform
   ```

2. **Start all services**
   ```bash
   docker-compose up --build
   ```

3. **Wait for services to be ready** (about 2-3 minutes)
   - Employee Service: http://localhost:3001
   - HR Operations Service: http://localhost:3002
   - Frontend: http://localhost:3000

4. **Access the application**
   - Frontend: http://localhost:3000 (Role-based dashboards)
   - API Documentation: 
     - Employee Service: http://localhost:3001/api-docs
     - HR Operations Service: http://localhost:3002/api-docs

### Local Development Setup

1. **Start databases**
   ```bash
   docker-compose up postgres mongodb -d
   ```

2. **Setup Employee Service**
   ```bash
   cd services/employee-service
   npm install
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

3. **Setup HR Operations Service**
   ```bash
   cd services/hr-operations-service
   npm install
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📊 Demo Accounts - Role-Based Dashboards

Each login redirects to a different dashboard based on user role:

| Role | Email | Password | Dashboard Features |
|------|-------|----------|-------------------|
| 👑 **Administrator** | admin@company.com | password123 | **Full System Control**<br/>• All employee management<br/>• System settings & analytics<br/>• User management<br/>• Audit logs & advanced reports |
| 👥 **HR Manager** | jane.smith@company.com | password123 | **HR Operations**<br/>• Employee management<br/>• Leave request approvals<br/>• Attendance reports<br/>• Recruitment & performance |
| 👤 **Employee** | john.doe@company.com | password123 | **Self-Service Portal**<br/>• Personal dashboard<br/>• Leave requests<br/>• Attendance tracking<br/>• Profile management |
| 👤 **Employee** | mike.johnson@company.com | password123 | Finance department employee |
| 👤 **Employee** | sarah.wilson@company.com | password123 | Marketing department employee |

> **Note**: The system automatically detects user role and redirects to the appropriate dashboard with role-specific navigation and features.

## 🏢 Features Implemented

### ✅ Employee Management
- Employee CRUD operations with Prisma ORM
- JWT-based authentication and authorization
- Role-based access control (Admin, HR Manager, Employee)
- Employee hierarchy (manager-subordinate relationships)
- Department-wise filtering and management

### ✅ Leave Management
- Leave request creation and approval workflow
- Multiple leave types (annual, sick, maternity, etc.)
- Leave balance tracking
- Manager approval system
- Leave history and reporting

### ✅ Attendance Tracking
- Check-in/check-out functionality
- Remote work support
- Attendance reports and analytics
- Monthly attendance summaries
- Late arrival tracking

### ✅ Role-Based Frontend System
- **🎯 Smart Role Detection**: Automatic role assignment based on position
- **📱 Role-Specific Dashboards**: Different layouts and navigation for each role
- **🔐 Granular Access Control**: Role-based permissions and feature access
- **🎨 Modern UI/UX**: Responsive React TypeScript with Tailwind CSS
- **⚡ Context API State Management**: Efficient authentication and user state
- **🛡️ Protected Routes**: Authentication-based route protection

### ✅ Production-Ready Backend
- Microservices architecture with service communication
- Centralized error handling and logging
- Input validation with Zod schemas
- Swagger API documentation
- Health check endpoints
- Docker containerization

## 🔧 API Endpoints

### Employee Service (Port 3001)
```
POST   /api/auth/login          - Employee login
POST   /api/auth/register       - Employee registration
GET    /api/auth/me             - Get current user
GET    /api/employees           - List employees
POST   /api/employees           - Create employee (HR only)
GET    /api/employees/:id       - Get employee details
PATCH  /api/employees/:id       - Update employee
DELETE /api/employees/:id       - Delete employee (HR only)
```

### HR Operations Service (Port 3002)
```
GET    /api/leave/requests      - Get my leave requests
POST   /api/leave/requests      - Create leave request
PATCH  /api/leave/requests/:id  - Update leave request
GET    /api/leave/balance       - Get leave balance
POST   /api/attendance/checkin  - Check in to work
POST   /api/attendance/checkout - Check out from work
GET    /api/attendance/my       - Get my attendance
GET    /api/attendance/report   - Attendance report (HR only)
```

## 🗄️ Database Schema

### PostgreSQL (Employee Service)
- **employees**: Core employee data with Prisma ORM
- Relationships: manager-subordinate hierarchy
- Indexes: email, department, status, manager_id

### MongoDB (HR Operations Service)
- **leave_requests**: Leave management data
- **attendance**: Daily attendance records
- **payroll**: Payroll processing data

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| mongodb | 27017 | MongoDB database |
| employee-service | 3001 | Employee management API |
| hr-operations-service | 3002 | HR operations API |
| frontend | 3000 | React TypeScript app |
| nginx | 80 | Reverse proxy (optional) |

## 📈 Monitoring & Logging

- **Winston logging** with file and console transports
- **Health check endpoints** for service monitoring
- **Error tracking** with structured logging
- **API request logging** with Morgan middleware

## 🔒 Security Features

- **JWT authentication** with secure token handling
- **Password hashing** with bcrypt
- **Input validation** with Zod schemas
- **CORS protection** configured for microservices
- **Helmet.js** security headers
- **Role-based access control**

## 🚧 Planned Features (Week 4)

- **AI Service**: RAG-powered Q&A system for HR policies
- **Payroll Management**: Automated payroll processing
- **Performance Reviews**: Employee evaluation system
- **Advanced Reporting**: Analytics dashboard
- **Email Notifications**: Automated HR notifications

## 📝 Development Notes

This project demonstrates:
- **Microservices Architecture** with service communication
- **Database Design** with proper relationships and indexes
- **Modern Frontend Development** with TypeScript and Tailwind
- **DevOps Practices** with Docker containerization
- **API Design** following RESTful principles
- **Security Best Practices** for enterprise applications
- **Error Handling** and validation strategies
- **Documentation** with Swagger/OpenAPI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the UPTIQ Fresher Onboarding Program and is for educational purposes.

---

**Built with ❤️ for UPTIQ Fresher Onboarding Program - Week 3 Project**