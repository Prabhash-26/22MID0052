/**
 * schedulerService.js
 * Core business logic for the Vehicle Maintenance Scheduler.
 *
 * Problem: Given vehicles with Duration (hours) and Impact (importance score),
 * and a depot's mechanic-hour budget, select tasks to MAXIMISE total Impact
 * without exceeding the available MechanicHours (0/1 Knapsack problem).
 *
 * Approach: Greedy by Impact/Duration ratio (efficient for large inputs).
 * For exact optimal results on smaller inputs, a DP knapsack is also available.
 */

const { getToken } = require("../utils/auth");
const { Log } = require("../utils/logger");

const BASE_URL = "http://4.224.186.213/evaluation-service";

/**
 * Fetch all depots from the evaluation API.
 */
async function fetchDepots() {
  await Log("info", "service", "Fetching depots from evaluation API");

  const token = await getToken();
  const response = await fetch(`${BASE_URL}/depots`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    await Log("error", "service", `Failed to fetch depots: ${response.status} - ${errText}`);
    throw new Error(`Failed to fetch depots: ${response.status}`);
  }

  const data = await response.json();
  await Log("info", "service", `Fetched ${data.depots.length} depots successfully`);
  return data.depots;
}

/**
 * Fetch all vehicles (tasks) from the evaluation API.
 */
async function fetchVehicles() {
  await Log("info", "service", "Fetching vehicles from evaluation API");

  const token = await getToken();
  const response = await fetch(`${BASE_URL}/vehicles`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    await Log("error", "service", `Failed to fetch vehicles: ${response.status} - ${errText}`);
    throw new Error(`Failed to fetch vehicles: ${response.status}`);
  }

  const data = await response.json();
  await Log("info", "service", `Fetched ${data.vehicles.length} vehicles successfully`);
  return data.vehicles;
}

/**
 * Greedy knapsack: select tasks sorted by Impact/Duration ratio descending.
 * Efficient for large inputs (O(n log n)).
 *
 * @param {Array} vehicles - [{TaskID, Duration, Impact}]
 * @param {number} budget  - mechanic hours available
 * @returns {{ selectedTasks, totalImpact, totalDuration, remainingHours }}
 */
function greedyKnapsack(vehicles, budget) {
  // Sort by impact-to-duration ratio descending (best value per hour first)
  const sorted = [...vehicles].sort((a, b) => {
    const ratioA = a.Impact / a.Duration;
    const ratioB = b.Impact / b.Duration;
    return ratioB - ratioA;
  });

  const selectedTasks = [];
  let totalImpact = 0;
  let totalDuration = 0;

  for (const vehicle of sorted) {
    if (totalDuration + vehicle.Duration <= budget) {
      selectedTasks.push(vehicle);
      totalImpact += vehicle.Impact;
      totalDuration += vehicle.Duration;
    }
  }

  return {
    selectedTasks,
    totalImpact,
    totalDuration,
    remainingHours: budget - totalDuration
  };
}

/**
 * DP 0/1 Knapsack: guaranteed optimal solution.
 * Use for smaller inputs (budget * n must be tractable).
 *
 * @param {Array} vehicles - [{TaskID, Duration, Impact}]
 * @param {number} budget  - mechanic hours available
 * @returns {{ selectedTasks, totalImpact, totalDuration, remainingHours }}
 */
function dpKnapsack(vehicles, budget) {
  const n = vehicles.length;
  // dp[i][w] = max impact using first i items with w hours budget
  const dp = Array.from({ length: n + 1 }, () => new Array(budget + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1];
    for (let w = 0; w <= budget; w++) {
      dp[i][w] = dp[i - 1][w]; // don't take item i
      if (Duration <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - Duration] + Impact); // take item i
      }
    }
  }

  // Backtrack to find selected tasks
  const selectedTasks = [];
  let w = budget;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selectedTasks.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }

  const totalImpact = selectedTasks.reduce((sum, v) => sum + v.Impact, 0);
  const totalDuration = selectedTasks.reduce((sum, v) => sum + v.Duration, 0);

  return {
    selectedTasks,
    totalImpact,
    totalDuration,
    remainingHours: budget - totalDuration
  };
}

/**
 * Main scheduling function.
 * Fetches all depots and vehicles, then runs the knapsack for each depot.
 */
async function scheduleMaintenanceTasks() {
  await Log("info", "service", "Starting vehicle maintenance scheduling process");

  const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);

  await Log("info", "service", `Processing ${depots.length} depots with ${vehicles.length} vehicle tasks`);

  const results = depots.map((depot) => {
    const budget = depot.MechanicHours;

    // Use DP knapsack if budget is tractable, else greedy
    const useDP = budget <= 500 && vehicles.length <= 200;
    let result;

    if (useDP) {
      result = dpKnapsack(vehicles, budget);
      result.algorithm = "dp_knapsack";
    } else {
      result = greedyKnapsack(vehicles, budget);
      result.algorithm = "greedy_knapsack";
    }

    return {
      depotID: depot.ID,
      mechanicHoursBudget: budget,
      algorithm: result.algorithm,
      totalImpact: result.totalImpact,
      totalDurationUsed: result.totalDuration,
      remainingHours: result.remainingHours,
      numberOfTasksSelected: result.selectedTasks.length,
      selectedTasks: result.selectedTasks.map((v) => ({
        taskID: v.TaskID,
        duration: v.Duration,
        impact: v.Impact
      }))
    };
  });

  await Log("info", "service", "Vehicle maintenance scheduling completed successfully");
  return { depots: results };
}

module.exports = { scheduleMaintenanceTasks, fetchDepots, fetchVehicles };
