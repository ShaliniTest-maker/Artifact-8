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

`npm start` runs `node index.js`. The server listens on port `3000` by default
(`process.env.PORT || 3000`); set the `PORT` environment variable to override it:

```bash
PORT=8080 npm start
```

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
