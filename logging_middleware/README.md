# Logging Middleware

A reusable logging package that sends structured log entries to the evaluation server.

## Usage

```js
const { Log } = require('./logging_middleware');

// Set your auth token as environment variable
// AUTH_TOKEN=<your_bearer_token> node app.js

await Log("backend", "info", "service", "Vehicle scheduler started");
await Log("backend", "error", "handler", "Failed to fetch depot data");
await Log("backend", "fatal", "db", "Critical database connection failure.");
```

## Function Signature

```
Log(stack, level, package, message)
```

## Valid Values

**stack:** `backend`, `frontend`

**level:** `debug`, `info`, `warn`, `error`, `fatal`

**package (backend):** `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`

**package (frontend):** `api`, `component`, `hook`, `page`, `state`, `style`

**package (both):** `auth`, `config`, `middleware`, `utils`
