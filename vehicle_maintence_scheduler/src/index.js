/**
 * index.js
 * Entry point for the Vehicle Maintenance Scheduler Microservice.
 *
 * Starts an Express server that exposes REST endpoints to:
 *  - Fetch depots and vehicles from the evaluation API
 *  - Run knapsack optimisation to maximise maintenance impact within mechanic-hour budgets
 *  - Log all significant events to the evaluation logging service
 */

require("dotenv").config();
const express = require("express");
const { Log } = require("./utils/logger");
const schedulerRoutes = require("./routes/schedulerRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging middleware
app.use(async (req, res, next) => {
  await Log("debug", "middleware", `Incoming request: ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/", schedulerRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "vehicle-maintence-scheduler" });
});

// 404 handler
app.use(async (req, res) => {
  await Log("warn", "handler", `404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use(async (err, req, res, next) => {
  await Log("fatal", "handler", `Unhandled server error: ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Start server
app.listen(PORT, async () => {
  await Log("info", "service", `Vehicle Maintenance Scheduler running on port ${PORT}`);
  console.log(`[Server] Vehicle Maintenance Scheduler running on http://localhost:${PORT}`);
  console.log(`[Server] Endpoints:`);
  console.log(`  GET http://localhost:${PORT}/schedule  -> Optimal maintenance schedule`);
  console.log(`  GET http://localhost:${PORT}/depots    -> All depots`);
  console.log(`  GET http://localhost:${PORT}/vehicles  -> All vehicles`);
  console.log(`  GET http://localhost:${PORT}/health    -> Health check`);
});

module.exports = app;
