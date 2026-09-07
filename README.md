# Artifact-8

## Overview

A minimal Node.js tutorial HTTP server built with Express. A single Express application
(`index.js`) serves two endpoints: the original `Hello world` endpoint and an added
`Good evening` endpoint.

## Prerequisites

- **Node.js** — 24.x (Active LTS) is the recommended runtime; 22.12.0 or newer on the 22.x
  (Maintenance LTS) line is also supported. `package.json` declares `engines.node` as
  `^22.12.0 || ^24.0.0`, deliberately narrower than Express 5's `>=18` minimum so that no
  end-of-life Node.js line is advertised as supported.
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
`PORT` environment variable to a whole number between `1` and `65535` to override it:

```bash
PORT=8080 npm start
```

`PORT` is validated before the listener is created. An unset or empty value keeps the
default `3000`. Any other value — a non-numeric string such as `abc`, a socket path such
as `/tmp/app.sock`, `0`, a negative or fractional number, or anything above `65535` — is
rejected with a single error line on stderr and the process exits with status `1` instead
of binding an unintended listener.

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
