/**
 * schedulerRoutes.js
 * Defines REST API routes for the vehicle maintenance scheduler.
 */

const express = require("express");
const router = express.Router();
const {
  getSchedule,
  getDepots,
  getVehicles
} = require("../controllers/schedulerController");

// GET /schedule - returns optimal maintenance schedule for all depots
router.get("/schedule", getSchedule);

// GET /depots - returns all depots with their mechanic hour budgets
router.get("/depots", getDepots);

// GET /vehicles - returns all vehicle maintenance tasks
router.get("/vehicles", getVehicles);

module.exports = router;
