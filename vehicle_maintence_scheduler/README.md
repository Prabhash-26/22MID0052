# Vehicle Maintenance Scheduler Microservice

A Node.js/Express microservice that optimises vehicle maintenance task scheduling for logistics depots using a Knapsack algorithm.

## Problem

Each depot has a daily **MechanicHours** budget. Each vehicle task has a **Duration** (hours) and **Impact** (importance score). The goal is to select tasks that **maximise total Impact** without exceeding the available MechanicHours.

## Algorithm

- **DP 0/1 Knapsack** (exact optimal) — used when budget ≤ 500 and tasks ≤ 200
- **Greedy by Impact/Duration ratio** (efficient, near-optimal) — used for larger inputs

## Setup

```bash
cd vehicle_maintence_scheduler
npm install
# Edit .env with your credentials
npm start
```

## Endpoints

| Method | Path        | Description                               |
|--------|-------------|-------------------------------------------|
| GET    | /schedule   | Optimal maintenance schedule for all depots |
| GET    | /depots     | All depots with MechanicHours budgets     |
| GET    | /vehicles   | All vehicle maintenance tasks             |
| GET    | /health     | Health check                              |

## Example Response - GET /schedule

```json
{
  "success": true,
  "data": {
    "depots": [
      {
        "depotID": 1,
        "mechanicHoursBudget": 60,
        "algorithm": "dp_knapsack",
        "totalImpact": 42,
        "totalDurationUsed": 58,
        "remainingHours": 2,
        "numberOfTasksSelected": 12,
        "selectedTasks": [
          { "taskID": "264e638f-...", "duration": 1, "impact": 5 }
        ]
      }
    ]
  }
}
```

## Folder Structure

```
vehicle_maintence_scheduler/
├── src/
│   ├── index.js                        # App entry point
│   ├── routes/
│   │   └── schedulerRoutes.js          # Route definitions
│   ├── controllers/
│   │   └── schedulerController.js      # Request handlers
│   ├── services/
│   │   └── schedulerService.js         # Business logic + knapsack
│   └── utils/
│       ├── auth.js                     # Token management
│       └── logger.js                   # Logging middleware wrapper
├── .env                                # Environment variables
├── package.json
└── README.md
```
