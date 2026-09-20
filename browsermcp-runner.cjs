const path = require('path');
const sdkPath = '/home/junho/.nvm/versions/node/v24.3.0/lib/node_modules/@browsermcp/mcp/node_modules/@modelcontextprotocol/sdk/dist/cjs';
const { Client } = require(path.join(sdkPath, 'client/index.js'));
const { StdioClientTransport } = require(path.join(sdkPath, 'client/stdio.js'));

async function run() {
  const [,, toolName, argsJson] = process.argv;
  if (!toolName) {
    console.error("Usage: node browsermcp-runner.cjs <toolName> [argsJson]");
    process.exit(1);
  }
  const args = argsJson ? JSON.parse(argsJson) : {};
  const transport = new StdioClientTransport({ command: 'mcp-server-browsermcp' });
  const client = new Client({ name: 'career-ops-runner', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  try {
    let res;
    for (let i = 0; i < 6; i++) {
      res = await client.callTool({ name: toolName, arguments: args });
      if (res.isError && res.content?.[0]?.text?.includes('No connection to browser extension')) {
        await new Promise(r => setTimeout(r, 800));
        continue;
      }
      break;
    }
    console.log(JSON.stringify(res));
  } finally {
    await client.close();
  }
}

run().catch(err => {
  console.error("Runner error:", err.message);
  process.exit(1);
});
