## UPTIQ HRMS - Week 3 Hands-on Project

This repository contains a production-ready scaffold for a microservices-based HRMS (Human Resource Management System), aligned with your Week 3 goals:

- **Backend Microservices**: `auth-service`, `hr-service`, `rag-service`
- **Frontend**: Placeholder folder to be implemented next
- **Observability-ready**: Structure prepared for Winston/Morgan, centralized error handling, Swagger, and Zod validation
- **Databases**: Two Postgres instances (auth, hr) and one MongoDB (rag/doc store)
- **Containerization**: Dockerfiles for each service and a single `docker-compose.yml` to orchestrate all services

### Quick Start

Prerequisites: Docker Desktop/Engine

```bash
docker compose up --build
```

Services:
- Auth Service: http://localhost:4001/health
- HR Service: http://localhost:4002/health
- RAG Service: http://localhost:4003/health
- Postgres (auth): localhost:5432
- Postgres (hr): localhost:5433
- MongoDB: localhost:27017

### Project Structure

```
.
├── docker-compose.yml
├── services
│   ├── auth-service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src
│   │       └── index.js
│   ├── hr-service
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src
│   │       └── index.js
│   └── rag-service
│       ├── Dockerfile
│       ├── package.json
│       └── src
│           └── index.js
└── frontend (placeholder)
```

### Next Steps (Week 3 Checklist Alignment)

- Add Winston/Morgan logging, centralized error handling, Swagger, and Zod validation to each service
- Implement JWT authentication in `auth-service` (Postgres)
- Implement Employees CRUD in `hr-service` (Postgres) protected via JWT
- Implement a simple RAG pipeline in `rag-service` using local embeddings and MongoDB for docs
- Add a React frontend consuming the microservices with Context-based state and robust error handling
- Wire a Bitbucket Pipeline for CI

# HRMS
