# HRMS Platform - UPTIQ Internship Project

A comprehensive Human Resource Management System built with microservices architecture.

## Architecture Overview

- **Employee Service**: Handles employee CRUD operations, profiles, and authentication
- **HR Operations Service**: Manages leave requests, attendance, payroll, and performance
- **Frontend**: React-based dashboard and employee portal
- **AI Service**: RAG-powered Q&A system for HR policies and procedures

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (primary), MongoDB (documents)
- **Frontend**: React, TypeScript, Tailwind CSS
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Validation**: Zod
- **Logging**: Winston
- **Containerization**: Docker, Docker Compose
- **AI**: RAG implementation for Q&A

## Getting Started

1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the application at `http://localhost:3000`

## Services

- Employee Service: `http://localhost:3001`
- HR Operations Service: `http://localhost:3002`
- Frontend: `http://localhost:3000`
- AI Service: `http://localhost:3003`

## Development

Each service can be developed independently. See individual service README files for specific setup instructions.