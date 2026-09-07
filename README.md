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
`ERR_SOCKET_BAD_PORT` instead of starting a server. The startup line prints the host and
port actually bound, so the URL it reports always works:

```bash
PORT=8080 npm start
```

### Network exposure

The server binds the loopback interface `127.0.0.1` by default, so it answers only
requests made from the machine it is running on. Set `HOST` to widen that deliberately —
for example to reach the server from outside the container or virtual machine it runs in:

```bash
HOST=0.0.0.0 npm start
```

`HOST=0.0.0.0` publishes both endpoints on every network the machine is attached to.
They serve two constant strings and hold no data, but nothing authenticates the caller,
so widen the bind only onto a network you trust.

### Production runs

Run the server with `NODE_ENV=production` anywhere that is not a development machine:

```bash
NODE_ENV=production npm start
```

Express reads `NODE_ENV` to decide its own `env` setting, and `development` — the setting
it assumes whenever `NODE_ENV` is unset — is the one under which the framework's built-in
final handler writes an error's stack trace into the response body. `index.js` registers
an error handler of its own, so a failed request is answered with `500 Internal Server
Error` and no stack in any environment; setting `NODE_ENV=production` closes the same
exposure at the framework level and enables Express's production defaults.

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
`Content-Type: text/html; charset=utf-8`. Each response also carries
`X-Content-Type-Options: nosniff`, so a client acts on that declared type instead of guessing
another one from the plain-text body — the same protection Express already applies to its own
`404` responses, now applied to the successful ones too. `GET /` is the original tutorial
endpoint, retained unchanged; `GET /good-evening` is the endpoint added alongside it.

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/` | `Hello world` |
| `GET` | `/good-evening` | `Good evening` |

Those two paths are the canonical ones, but they are not the only spellings that reach the
handlers. Express matches routes case-insensitively and tolerates a single trailing slash
unless its `case sensitive routing` and `strict routing` settings are enabled, and this server
leaves both at their defaults: `/Good-Evening`, `/GOOD-EVENING` and `/good-evening/` all return
`Good evening`, and `//` returns `Hello world`. The tolerance stops there — a second slash
(`/good-evening//`, `///`) and a percent-encoded path (`/%67ood-evening`, which is not decoded
before matching) both return Express's default `404`. Every spelling that matches returns the
same constant as the canonical path, so the wider surface adds no behaviour beyond the table.

## Verify

With the server running, from the machine it is running on — which is the only place the
default loopback bind answers:

```bash
curl -s http://localhost:3000/
# Hello world

curl -s http://localhost:3000/good-evening
# Good evening
```
