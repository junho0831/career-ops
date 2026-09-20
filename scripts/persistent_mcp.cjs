const path = require('path');
const sdkPath = '/home/junho/.nvm/versions/node/v24.3.0/lib/node_modules/@browsermcp/mcp/node_modules/@modelcontextprotocol/sdk/dist/cjs';
const { Client } = require(path.join(sdkPath, 'client/index.js'));
const { StdioClientTransport } = require(path.join(sdkPath, 'client/stdio.js'));
const http = require('http');

let transport = null;
let client = null;

async function ensureClient() {
  if (client) return client;
  transport = new StdioClientTransport({ command: 'mcp-server-browsermcp' });
  client = new Client({ name: 'persistent-bridge', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  console.log('[persistent] MCP Server connected on stdio, listening on ws://localhost:9009');
  return client;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { tool, args } = JSON.parse(body);
        const cli = await ensureClient();
        const r = await cli.callTool({ name: tool, arguments: args || {} });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(r));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bridge running');
  }
});

ensureClient().then(() => {
  server.listen(9099, '127.0.0.1', () => {
    console.log('[persistent] HTTP bridge ready on http://127.0.0.1:9099');
  });
});
