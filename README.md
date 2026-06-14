# Convergy Engineering Excellence Portal

A modern, enterprise-grade engineering productivity platform for tracking work beyond Jira story points.

## Overview

- Frontend: React + Material UI
- Backend: Spring Boot 3 + Java 21
- Database: PostgreSQL
- Authentication: JWT with role-based access control
- Deployment: Docker + Kubernetes compatible

## Workspace Structure

- `backend/` — Spring Boot application, domain modules, API layer, security, Docker support.
- `frontend/` — React application built with Vite, Material UI theme, responsive layout.
- `k8s/` — Kubernetes manifests for backend and frontend.
- `docker-compose.yml` — Local container orchestration.
- `docs/` — Architecture, schema, API contracts, ERD.

## Next Steps

1. Review `backend/pom.xml` and `frontend/package.json`.
2. Configure PostgreSQL credentials in `backend/src/main/resources/application.yml`.
3. Build and run backend:
   - `./mvnw spring-boot:run`
4. Build and run frontend:
   - `cd frontend && npm install && npm run dev`

## Notes

This scaffold provides a starting structure for core modules and user interfaces. Further feature implementation can proceed using the documented architecture and API contracts.
