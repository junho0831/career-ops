const { spawn } = require('child_process');

let server = null;

function startServer() {
  server = spawn('mcp-server-browsermcp', [], {
    stdio: ['pipe', 'inherit', 'inherit']
  });

  // Keep stdin stream active by writing a heartbeat or keeping the pipe open
  const interval = setInterval(() => {
    if (server && !server.killed && server.stdin.writable) {
      server.stdin.write('{}\n');
    }
  }, 10000);

  server.on('exit', (code, sig) => {
    console.log(`browsermcp server exited (${code}, ${sig}), restarting in 1s...`);
    clearInterval(interval);
    setTimeout(startServer, 1000);
  });
}

startServer();

process.on('SIGINT', () => {
  if (server) server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (server) server.kill();
  process.exit(0);
});
