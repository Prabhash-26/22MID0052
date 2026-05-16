/**
 * schedulerController.js
 * Handles HTTP requests for vehicle maintenance scheduling endpoints.
 */

const { scheduleMaintenanceTasks, fetchDepots, fetchVehicles } = require("../services/schedulerService");
const { Log } = require("../utils/logger");

/**
 * GET /schedule
 * Returns the optimal maintenance schedule for all depots.
 */
async function getSchedule(req, res) {
  await Log("info", "controller", "GET /schedule - request received");

  try {
    const result = await scheduleMaintenanceTasks();
    await Log("info", "controller", `GET /schedule - returning schedule for ${result.depots.length} depots`);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    await Log("error", "controller", `GET /schedule - error: ${err.message}`);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

/**
 * GET /depots
 * Returns all available depots with their mechanic hour budgets.
 */
async function getDepots(req, res) {
  await Log("info", "controller", "GET /depots - request received");

  try {
    const depots = await fetchDepots();
    await Log("info", "controller", `GET /depots - returned ${depots.length} depots`);
    return res.status(200).json({ success: true, data: { depots } });
  } catch (err) {
    await Log("error", "controller", `GET /depots - error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /vehicles
 * Returns all vehicle maintenance tasks.
 */
async function getVehicles(req, res) {
  await Log("info", "controller", "GET /vehicles - request received");

  try {
    const vehicles = await fetchVehicles();
    await Log("info", "controller", `GET /vehicles - returned ${vehicles.length} vehicles`);
    return res.status(200).json({ success: true, data: { vehicles } });
  } catch (err) {
    await Log("error", "controller", `GET /vehicles - error: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = { getSchedule, getDepots, getVehicles };
