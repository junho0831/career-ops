const path = require('path');
const sdkPath = '/home/junho/.nvm/versions/node/v24.3.0/lib/node_modules/@browsermcp/mcp/node_modules/@modelcontextprotocol/sdk/dist/cjs';
const { Client } = require(path.join(sdkPath, 'client/index.js'));
const { StdioClientTransport } = require(path.join(sdkPath, 'client/stdio.js'));
const http = require('http');

let client = null;

async function getConnectedClient() {
  if (client && client.transport) {
    return client;
  }
  console.log('[bridge] Spawning fresh browsermcp client connection...');
  const transport = new StdioClientTransport({ command: 'mcp-server-browsermcp' });
  client = new Client({ name: 'career-ops-mcp-server', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  console.log('[bridge] Connected to browsermcp subprocess on stdio.');
  return client;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { tool, args } = JSON.parse(body);
        const cli = await getConnectedClient();
        const result = await cli.callTool({ name: tool, arguments: args || {} });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('[bridge] Tool call error:', err.message);
        client = null;
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('browsermcp HTTP bridge running');
  }
});

server.listen(9099, '127.0.0.1', async () => {
  console.log('browsermcp bridge server listening on http://127.0.0.1:9099');
  try {
    await getConnectedClient();
  } catch (e) {
    console.error('[bridge] Initial client error:', e.message);
  }
});
