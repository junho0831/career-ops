const { spawn } = require('child_process');
const WebSocket = require('/home/junho/.nvm/versions/node/v24.3.0/lib/node_modules/@browsermcp/mcp/node_modules/ws');

let serverProc = null;

function runServer() {
  serverProc = spawn('mcp-server-browsermcp', [], {
    stdio: ['pipe', 'inherit', 'inherit']
  });
  
  serverProc.stdin.resume();

  serverProc.on('exit', (code, sig) => {
    console.log(`[mcp daemon] Server exited (${code}, ${sig}), restarting...`);
    setTimeout(runServer, 1000);
  });
}

runServer();

process.on('SIGINT', () => {
  if (serverProc) serverProc.kill();
  process.exit(0);
});
process.on('SIGTERM', () => {
  if (serverProc) serverProc.kill();
  process.exit(0);
});
