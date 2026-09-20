const http = require('http');

async function callBrowser(tool, args = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ tool, args });
    const req = http.request('http://127.0.0.1:9099', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  const [,, tool, argsJson] = process.argv;
  const args = argsJson ? JSON.parse(argsJson) : {};
  const res = await callBrowser(tool, args);
  console.log(JSON.stringify(res));
}

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { callBrowser };
