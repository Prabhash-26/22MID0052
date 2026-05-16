/**
 * logger.js
 * Wraps the logging middleware for use throughout the vehicle scheduler service.
 */

const { getToken } = require("./auth");

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

/**
 * Send a log entry to the evaluation server.
 * @param {string} level - debug | info | warn | error | fatal
 * @param {string} pkg   - backend package name
 * @param {string} message - descriptive message
 */
async function Log(level, pkg, message) {
  try {
    const token = await getToken();

    const payload = {
      stack: "backend",
      level,
      package: pkg,
      message
    };

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
      console.error(`[Logger] Failed: ${response.status} - ${errText}`);
      return;
    }

    const data = await response.json();
    console.log(`[Logger][${level.toUpperCase()}][${pkg}] ${message} | LogID: ${data.logID}`);
  } catch (err) {
    console.error(`[Logger] Error sending log: ${err.message}`);
  }
}

module.exports = { Log };
