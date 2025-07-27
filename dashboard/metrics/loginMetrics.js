// dashboard/metrics/loginMetrics.js
const client = require("prom-client");

const loginAttempts = new client.Counter({
  name: "login_attempts_total",
  help: "Total number of login attempts",
});

const loginFailures = new client.Counter({
  name: "login_failures_total",
  help: "Total number of failed login attempts",
});

const loginSuccesses = new client.Counter({
  name: "login_successes_total",
  help: "Total number of successful login attempts",
});

module.exports = {
  loginAttempts,
  loginFailures,
  loginSuccesses,
};
