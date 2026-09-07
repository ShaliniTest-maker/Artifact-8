/**
 * Artifact-8 - minimal Node.js tutorial server built with Express.
 *
 * A single Express application serves both endpoints:
 *   GET /             -> Hello world
 *   GET /good-evening -> Good evening
 *
 * Start it with `npm start` (equivalent to `node index.js`). The listener binds
 * port 3000 by default; set the PORT environment variable to override it, e.g.
 * `PORT=8080 npm start`.
 */
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Original tutorial endpoint, preserved verbatim and now served through Express.
app.get('/', (req, res) => res.send('Hello world'));

// Second endpoint added by this feature.
app.get('/good-evening', (req, res) => res.send('Good evening'));

// Express forwards an asynchronous bind failure (for example EADDRINUSE when the
// port is already taken) to this same callback as its first argument, so the error
// has to be checked before anything is reported as started: without the check a
// failed bind would still print the listening message and exit successfully.
app.listen(PORT, (error) => {
  if (error) {
    console.error(`Failed to start server on port ${PORT}:`, error);
    process.exitCode = 1;
    return;
  }

  console.log(`Server listening on http://localhost:${PORT}`);
});
