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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
