# API Contracts

## Daily Status Tracker
- POST /api/status
  - Request: { date, jiraId, taskName, workDescription, status, blockerDescription, hoursSpent, priority }
  - Response: object persisted
- GET /api/status
  - Response: array of status records

## Dashboard
- GET /api/dashboard/stats
  - Response: aggregated metrics for the dashboard
