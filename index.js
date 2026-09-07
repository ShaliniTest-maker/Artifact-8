const express = require('express');

const app = express();
// Express advertises itself with `X-Powered-By: Express` on every response unless
// this setting is disabled, which is free framework fingerprinting for a scanner.
app.disable('x-powered-by');

// The coercion wraps the whole fallback: a port left as a string is treated as a pipe
// name by `listen`, and `0` is falsy, so it must reach `Number` rather than the default.
const PORT = Number(process.env.PORT || 3000);

app.get('/', (req, res) => res.send('Hello world'));

app.get('/good-evening', (req, res) => res.send('Good evening'));

// Express forwards an asynchronous bind failure (for example EADDRINUSE when the
// port is already taken) to this same callback as its first argument, so the error
// has to be checked before anything is reported as started: without the check a
// failed bind would still print the listening message and exit successfully.
const server = app.listen(PORT, (error) => {
  if (error) {
    console.error(`Failed to start server on port ${PORT}:`, error);
    process.exitCode = 1;
    return;
  }

  console.log(`Server listening on http://localhost:${server.address().port}`);
});
