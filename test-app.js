// Test script to verify all components of the React ATS application are running
const http = require('http');

console.log('📋 React ATS Application Test Script');
console.log('====================================');
console.log('This script checks if all components of the application are running correctly.\n');

// Array of services to check
const services = [
  { name: 'Frontend', url: 'http://localhost:3000', path: '/' },
  { name: 'API Server', url: 'http://localhost:3001', path: '/api/health' },
  { name: 'CV Parsing Server', url: 'http://localhost:5001', path: '/api/parse-cv/status' },
];

// Counter for tracking completed checks
let completedChecks = 0;
const results = [];

// Function to check a service
function checkService(service) {
  console.log(`Checking ${service.name} at ${service.url}${service.path}...`);

  const url = new URL(service.url + service.path);

  const req = http.request(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: 3000, // 3 second timeout
    },
    (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        results.push({
          service: service.name,
          status: isSuccess ? 'Running' : 'Error',
          statusCode: res.statusCode,
          data: data.substring(0, 100), // Limit data length
        });

        handleCompletion();
      });
    }
  );

  req.on('error', (error) => {
    results.push({
      service: service.name,
      status: 'Error',
      error: error.message,
    });

    handleCompletion();
  });

  req.on('timeout', () => {
    results.push({
      service: service.name,
      status: 'Timeout',
      error: 'Connection timed out',
    });

    req.destroy();
    handleCompletion();
  });

  req.end();
}

// Handle completion of all checks
function handleCompletion() {
  completedChecks++;

  if (completedChecks === services.length) {
    printResults();
  }
}

// Print results table
function printResults() {
  console.log('\n📊 Test Results:');
  console.log('=============\n');

  let allSuccess = true;

  results.forEach((result) => {
    const icon = result.status === 'Running' ? '✅' : '❌';
    console.log(`${icon} ${result.service}: ${result.status}`);

    if (result.status !== 'Running') {
      allSuccess = false;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.statusCode) {
        console.log(`   Status Code: ${result.statusCode}`);
      }
    }
  });

  console.log('\n📝 Summary:');

  if (allSuccess) {
    console.log('✅ All components are running correctly!');
    console.log('\nYou can access the application at http://localhost:3000');
  } else {
    console.log('❌ Some components are not running correctly.');
    console.log('\nTo start the full application, run:');
    console.log('  node run-ats.js');
    console.log('\nIf you need to start components individually:');
    console.log('1. CV Parsing Server: node server/index.js');
    console.log('2. API Server: npm run server');
    console.log('3. Frontend: npm run dev');
  }
}

// Start checking all services
services.forEach(checkService);
