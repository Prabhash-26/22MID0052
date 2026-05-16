/**
 * Logging Middleware
 * Reusable logging package that sends logs to the Affordmed evaluation server.
 * Usage: Log(stack, level, package, message)
 */

const AUTH_TOKEN = process.env.AUTH_TOKEN || "";
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

/**
 * Valid values for stack, level, package fields
 */
const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES_BACKEND = [
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service"
];
const VALID_PACKAGES_FRONTEND = ["api", "component", "hook", "page", "state", "style"];
const VALID_PACKAGES_BOTH = ["auth", "config", "middleware", "utils"];

/**
 * Core Log function - sends a log entry to the evaluation server
 * @param {string} stack - "backend" or "frontend"
 * @param {string} level - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg - package name (see valid values)
 * @param {string} message - descriptive log message
 */
async function Log(stack, level, pkg, message) {
  // Validate inputs
  if (!VALID_STACKS.includes(stack)) {
    console.error(`[Logger] Invalid stack: "${stack}". Must be one of: ${VALID_STACKS.join(", ")}`);
    return;
  }
  if (!VALID_LEVELS.includes(level)) {
    console.error(`[Logger] Invalid level: "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`);
    return;
  }

  const allValidPackages = [...VALID_PACKAGES_BACKEND, ...VALID_PACKAGES_FRONTEND, ...VALID_PACKAGES_BOTH];
  if (!allValidPackages.includes(pkg)) {
    console.error(`[Logger] Invalid package: "${pkg}". Must be one of: ${allValidPackages.join(", ")}`);
    return;
  }

  const token = AUTH_TOKEN || process.env.AUTH_TOKEN;
  if (!token) {
    console.error("[Logger] AUTH_TOKEN not set. Cannot send log.");
    return;
  }

  const payload = {
    stack,
    level,
    package: pkg,
    message
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Logger] Failed to send log. Status: ${response.status}, Body: ${errText}`);
      return;
    }

    const data = await response.json();
    console.log(`[Logger] Log sent successfully. LogID: ${data.logID}`);
  } catch (err) {
    console.error(`[Logger] Network error while sending log: ${err.message}`);
  }
}

module.exports = { Log };
