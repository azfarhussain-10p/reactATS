// Simple test script to verify CV parsing server is running correctly
const http = require('http');

console.log('Testing CV Parsing Server...');

// Try to connect to the server status endpoint
const req = http.request(
  {
    hostname: 'localhost',
    port: 5001,
    path: '/api/parse-cv/status',
    method: 'GET',
    timeout: 2000, // 2 second timeout
  },
  (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ CV Parsing Server is running correctly!');
        console.log(`Response: ${data}`);
        process.exit(0);
      } else {
        console.error(`❌ Server returned status code: ${res.statusCode}`);
        process.exit(1);
      }
    });
  }
);

req.on('error', (error) => {
  console.error('❌ Error connecting to CV Parsing Server:');
  console.error(`   ${error.message}`);
  console.error('\nMake sure the server is running with:');
  console.error('   node index.js');
  console.error('\nOr run the full application with:');
  console.error('   node ../run-ats.js');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Connection to CV Parsing Server timed out');
  console.error('\nMake sure the server is running with:');
  console.error('   node index.js');
  console.error('\nOr run the full application with:');
  console.error('   node ../run-ats.js');
  req.destroy();
  process.exit(1);
});

req.end();

console.log('Checking server at http://localhost:5001/api/parse-cv/status ...');
