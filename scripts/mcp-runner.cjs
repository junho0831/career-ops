const path = require('path');
const sdkPath = '/home/junho/.nvm/versions/node/v24.3.0/lib/node_modules/@browsermcp/mcp/node_modules/@modelcontextprotocol/sdk/dist/cjs';
const { Client } = require(path.join(sdkPath, 'client/index.js'));
const { StdioClientTransport } = require(path.join(sdkPath, 'client/stdio.js'));

let clientInstance = null;
let transportInstance = null;

async function getClient() {
  if (clientInstance) return clientInstance;
  transportInstance = new StdioClientTransport({ command: 'mcp-server-browsermcp' });
  clientInstance = new Client({ name: 'career-ops-runner', version: '1.0.0' }, { capabilities: {} });
  await clientInstance.connect(transportInstance);
  return clientInstance;
}

async function callTool(name, args = {}) {
  const client = await getClient();
  const res = await client.callTool({ name, arguments: args });
  return res;
}

async function main() {
  const [,, toolName, argsJson] = process.argv;
  if (!toolName) {
    console.error("Usage: node mcp-runner.cjs <toolName> [argsJson]");
    process.exit(1);
  }
  const args = argsJson ? JSON.parse(argsJson) : {};
  try {
    const res = await callTool(toolName, args);
    console.log(JSON.stringify(res));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    if (clientInstance) await clientInstance.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { callTool };
