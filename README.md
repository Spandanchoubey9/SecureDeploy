# SecureDeploy

SecureDeploy is a full-stack deployment management platform designed to demonstrate a secure and automated DevOps workflow.

## Current Technology Stack

- React + Vite
- Node.js + Express
- PostgreSQL
- Docker
- Docker Compose
- JWT Authentication
- Role-Based Access Control (RBAC)
- Git / GitHub
- Jenkins CI/CD
- AWS

## Application Features

- Secure user authentication
- Role-based authorization
- Employee management
- Deployment management
- Deployment status tracking
- Audit logging
- Infrastructure monitoring dashboard
- PostgreSQL-backed persistent data

## DevOps Workflow

Developer → GitHub → Jenkins → Build → Test → Docker → AWS → Deployment Status

Jenkins will automate the application build and deployment process, while SecureDeploy will provide visibility into deployment status and history.

## Project Status

The application and Docker-based local environment are currently implemented.

CI/CD integration with Jenkins and cloud deployment to AWS are being developed as the next phase.

## Local Development

The application currently runs through Docker Compose.

| Service | Port |
|---|---:|
| Frontend | 5173 |
| Backend API | 5001 |
| PostgreSQL | 5433 |

