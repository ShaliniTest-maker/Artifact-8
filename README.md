# Artifact-8

## Overview

A minimal Node.js tutorial HTTP server built with Express. A single Express application
(`index.js`) serves two endpoints: the original `Hello world` endpoint and an added
`Good evening` endpoint.

## Prerequisites

- **Node.js** — 24.x (Active LTS) is the recommended runtime; Node.js `>=18` is required,
  matching Express 5's minimum supported version and the `engines.node` range declared in
  `package.json`.
- **npm** — bundled with Node.js.

## Install

```bash
npm install
```

This resolves the `express` (`^5.2.1`) dependency declared in `package.json`. The generated
`node_modules/` directory is git-ignored.

## Run

```bash
npm start
```

`npm start` runs `node index.js`. The server listens on port `3000` by default; set the
`PORT` environment variable to override it. The value is read as a number
(`Number(process.env.PORT || 3000)`), so leaving `PORT` unset or empty falls back to
`3000`, `PORT=0` asks the operating system for a free port, and a value that is not a
usable port number (for example `abc` or `-1`) makes startup fail immediately with Node's
`ERR_SOCKET_BAD_PORT` instead of starting a server. The startup line prints the address
actually bound, so the URL it reports always works:

```bash
PORT=8080 npm start
```

### Stopping and restarting

`npm start` does not serve requests in the npm process itself: npm runs `node index.js`
through a shell, and when npm is signalled it terminates only that immediate child. A stop
therefore has to reach the `node index.js` process. Each of the following ends the listener
and releases the port, so `npm start` works again immediately afterwards. The commands use
the default port `3000` — substitute the port the server was started on.

```bash
# Foreground start: press Ctrl-C — the terminal signals npm and node together.

# Background start in its own process group, then signal that group
# (note the leading '-' in front of the process-group id):
setsid npm start &
kill -TERM -"$(ps -o pgid= -p "$(lsof -ti :3000)" | tr -d ' ')"

# Or signal the listener directly, which ends the npm wrapper with it:
kill "$(lsof -ti :3000)"
```

Signalling only the npm process — `kill -TERM <npm pid>` — stops the wrapper but leaves
`node index.js` running, reparented to PID 1 and still holding the port, so the next
`npm start` fails with `Error: listen EADDRINUSE: address already in use`. Recover with
`kill "$(lsof -ti :3000)"` and start the server again. Where a process supervisor runs the
server, point it at `node index.js` rather than `npm start`, so the process it signals is
the listener itself.

## Endpoints

Both endpoints respond with HTTP `200 OK` and the exact string body shown in the table below.
The handlers pass those strings to Express's `res.send()`, which applies Express's default
content type for string bodies, so each response carries the header
`Content-Type: text/html; charset=utf-8`. `GET /` is the original tutorial endpoint, retained
unchanged; `GET /good-evening` is the endpoint added alongside it.

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/` | `Hello world` |
| `GET` | `/good-evening` | `Good evening` |

## Verify

With the server running:

```bash
curl -s http://localhost:3000/
# Hello world

curl -s http://localhost:3000/good-evening
# Good evening
```
