# DevTrack — Converge Engineering Portal

A full-stack project management and engineering productivity platform for tracking stories, bugs, daily logs, deployments, and team activity.

## Live URLs

- **Frontend:** https://devtrack-converge.vercel.app
- **Backend API:** https://devtrack-converge.onrender.com/api

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Material UI v5 |
| Backend | Spring Boot 3.2 + Java 21 + JPA |
| Database | PostgreSQL (Neon cloud free tier) |
| Frontend Hosting | Vercel (auto-deploy from GitHub `main`) |
| Backend Hosting | Render free tier (Docker container) |

## Features

- **Dashboard** — story points, deployments stat, today's activity, active stories, open bugs
- **People** — developer profiles with roles, emails, team assignments
- **Teams** — team management with sprints, members, active sprint tracking
- **Stories** — sprint/monthly view, status tracking, auto-fill started/completed dates
- **Daily Log** — work log per developer with story linking
- **Bugs & Issues** — severity tracking, auto-fill resolved date
- **Deployments** — upcoming (scheduled) and completed tabs
- **Reports** — timesheet view with weekly breakdown
- **Mobile responsive** — hamburger sidebar, wrapping filter rows, stacking form fields

## Project Structure

```
devtrack-converge/
├── frontend/          React + Vite app (deployed to Vercel)
│   ├── src/
│   │   ├── pages/     One file per page
│   │   ├── context/   AppContext (backend probe, heartbeat, auth)
│   │   ├── api/       API mapping functions
│   │   ├── data/      Mock data (offline fallback)
│   │   └── layout/    MainLayout with responsive sidebar
│   └── index.html
└── backend/           Spring Boot app (deployed to Render via Docker)
    ├── src/main/java/com/converge/
    │   ├── controller/    REST controllers (7 resources)
    │   ├── entity/        JPA entities
    │   ├── repository/    Spring Data repositories
    │   └── config/        CORS, data initializer
    ├── Dockerfile
    └── pom.xml
```

## Local Development

### Backend

Requires Java 21. Create `backend/src/main/resources/application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://<your-neon-host>/neondb?sslmode=require
    username: <username>
    password: <password>
```

Run with local profile:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend auto-detects backend availability and falls back to mock data if offline.

## Environment Variables

### Render (backend)
| Variable | Description |
|---|---|
| `DB_URL` | Neon PostgreSQL JDBC URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `PORT` | Server port (Render sets this automatically) |

### Vercel (frontend)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `https://devtrack-converge.onrender.com`) |

## Backend Cold Start

Render free tier sleeps after 15 min of inactivity. The frontend automatically retries for up to 90 seconds on load and shows a "Server starting…" banner. A 10-minute heartbeat keeps the backend awake while users are logged in.

To prevent cold starts entirely, set up a free monitor at **uptimerobot.com** pointing to `https://devtrack-converge.onrender.com/api/teams` with a 5-minute interval.
