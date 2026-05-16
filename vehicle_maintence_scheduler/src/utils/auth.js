/**
 * auth.js
 * Manages authentication token for the evaluation service APIs.
 */

require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID || "32eee436-5c60-4153-827f-0d939dbf4095";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "myDbHgrdCJXHZQQQ";
const EMAIL = process.env.EMAIL || "prabhash.s2022@vitstudent.ac.in";
const ROLL_NO = process.env.ROLL_NO || "22mid0052";
const ACCESS_CODE = process.env.ACCESS_CODE || "SfFuWg";
const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";

let cachedToken = process.env.AUTH_TOKEN || null;
let tokenExpiry = process.env.AUTH_TOKEN ? Date.now() + 3600000 : 0;

/**
 * Returns a valid Bearer token, re-authenticating if expired.
 */
async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const payload = {
    email: EMAIL,
    name: "ram krishna",
    rollNo: ROLL_NO,
    accessCode: ACCESS_CODE,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  };

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Auth failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  // expires_in is a Unix timestamp
  tokenExpiry = data.expires_in * 1000;
  return cachedToken;
}

module.exports = { getToken };
