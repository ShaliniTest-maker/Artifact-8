const express = require('express');

const app = express();
// Express advertises itself with `X-Powered-By: Express` on every response unless
// this setting is disabled, which is free framework fingerprinting for a scanner.
app.disable('x-powered-by');

app.get('/', (req, res) => res.send('Hello world'));

app.get('/good-evening', (req, res) => res.send('Good evening'));

// Environment values are always strings, and Node reads a string it cannot take as
// a port as an IPC path instead: an unvalidated `abc` or `/tmp/app.sock` quietly
// starts a pipe server while the startup line still advertises an HTTP URL, `0`
// binds an unpredictable ephemeral port, and `1.5`, `65536` or a space throws
// ERR_SOCKET_BAD_PORT synchronously, before app.listen's callback can report it.
// Port 0 is deliberately unsupported because the startup line promises the port
// that was asked for.
function resolvePort(rawPort) {
  if (rawPort === undefined || rawPort === '') {
    return 3000;
  }

  if (!/^[0-9]+$/.test(rawPort)) {
    return null;
  }

  const port = Number(rawPort);

  return port >= 1 && port <= 65535 ? port : null;
}

const PORT = resolvePort(process.env.PORT);

if (PORT === null) {
  // JSON.stringify escapes the quotes and the C0 controls, but it leaves DEL, the
  // C1 range and U+2028/U+2029 intact, and log readers that treat those as line
  // breaks would still see a forged second line. So every code point outside
  // printable ASCII is escaped as well: the diagnostic is always one line of
  // printable ASCII, whatever the environment held.
  const rejected = JSON.stringify(String(process.env.PORT)).replace(
    /[^\x20-\x7e]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`
  );

  console.error(`Invalid PORT ${rejected}: expected an integer between 1 and 65535.`);
  process.exitCode = 1;
} else {
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
}
