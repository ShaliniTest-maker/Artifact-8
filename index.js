const express = require('express');

const app = express();
// Express advertises itself with `X-Powered-By: Express` on every response unless
// this setting is disabled, which is free framework fingerprinting for a scanner.
app.disable('x-powered-by');

// The coercion wraps the whole fallback: a port left as a string is treated as a pipe
// name by `listen`, and `0` is falsy, so it must reach `Number` rather than the default.
const PORT = Number(process.env.PORT || 3000);

// `res.send` labels a string body `text/html; charset=utf-8`, which invites a client to
// sniff a constant plain-text payload as markup, and Express sets nothing to stop it on a
// successful response. Its own 404 path already answers that with `X-Content-Type-Options:
// nosniff`, so setting the same header here makes the success path consistent with the error
// path and pins the declared type as the only one a browser may act on. The header is set on
// the response rather than through middleware, leaving both bodies byte-exact.
app.get('/', (req, res) =>
  res.set('X-Content-Type-Options', 'nosniff').send('Hello world'));

app.get('/good-evening', (req, res) =>
  res.set('X-Content-Type-Options', 'nosniff').send('Good evening'));

// Without an error handler of its own, an application leaves error rendering to the
// framework's built-in final handler, which embeds `err.stack` in the response body
// whenever `app.get('env')` is `development` -- the value Express derives from
// `NODE_ENV`, and therefore the value it assumes whenever `NODE_ENV` is unset. Any
// request that provoked a failure would be answered with absolute source paths and
// framework internals. Registering a four-argument handler takes that rendering away
// from the framework in every environment, so the stack stays on the operator's side
// of the boundary and the client is told only that the request failed. The response
// headers mirror the ones the built-in handler sets on an error, so this path keeps
// the posture the framework's own 404 responses already have. Unmatched routes still
// reach that built-in handler, which is what continues to answer them with a 404.
app.use((error, req, res, next) => {
  console.error(`Error handling ${req.method} ${req.originalUrl}:`, error);

  if (res.headersSent) {
    // The status line and headers are already on the wire, so there is nothing left
    // to rewrite: hand the error back so the framework's final handler destroys the
    // socket rather than appending a second response to one a client is reading.
    next(error);
    return;
  }

  res
    .status(500)
    .set({
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    })
    .send('Internal Server Error');
});

// `listen` binds every interface the machine has when it is given no host, which
// publishes both endpoints to every network that machine is attached to. Loopback is
// the right default for a tutorial server -- it answers only the machine it runs on --
// and `HOST` widens that deliberately (`HOST=0.0.0.0`) for the cases that need it,
// such as reaching the server from outside a container.
const HOST = process.env.HOST || '127.0.0.1';

// Express forwards an asynchronous bind failure (for example EADDRINUSE when the
// port is already taken) to this same callback as its first argument, so the error
// has to be checked before anything is reported as started: without the check a
// failed bind would still print the listening message and exit successfully.
const server = app.listen(PORT, HOST, (error) => {
  if (error) {
    console.error(`Failed to start server on ${HOST}:${PORT}:`, error);
    process.exitCode = 1;
    return;
  }

  const { address, port } = server.address();
  // Report the address that was actually bound rather than the one that was asked
  // for, so the printed URL always works. A wildcard bind reports `0.0.0.0` or `::`,
  // neither of which is a useful thing to paste into a client, and a bare IPv6
  // address is not a valid URL host until it is bracketed.
  let displayHost = address;
  if (address === '0.0.0.0' || address === '::') {
    displayHost = 'localhost';
  } else if (address.includes(':')) {
    displayHost = `[${address}]`;
  }

  console.log(`Server listening on http://${displayHost}:${port}`);
});

// A failure that surfaces outside a request -- a throw or a rejected promise in a
// timer, a socket callback or any other detached continuation -- is not something the
// error handler above can see, because no request is in flight to answer. It also
// leaves the process holding state no code has reasoned about. Trapping such a
// failure and carrying on would be worse than not trapping it at all: it would
// suppress the runtime's own termination and keep a process serving traffic after it
// has lost its invariants. So each one is reported for diagnosis, the listener is
// closed to release the port for whatever restarts the server, and the process leaves
// with a failing status.
const exitOnFatalError = (label) => (error) => {
  console.error(`${label}:`, error);
  process.exitCode = 1;

  server.close(() => process.exit(1));
  // Closing waits for connections that are still open, so a client holding one must
  // not be able to keep a broken process alive. The timer is unreferenced, so it
  // forces the exit only if something else is still holding the event loop open, and
  // never delays an exit that the close already completed.
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('uncaughtException', exitOnFatalError('Uncaught exception'));
process.on('unhandledRejection', exitOnFatalError('Unhandled promise rejection'));
