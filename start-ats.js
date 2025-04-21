import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting ATS Application with API Server...');

// Start the API server
const apiServer = spawn('node', ['src/server.js'], {
  stdio: 'inherit',
  shell: true
});

// Wait for the API server to start before starting the frontend
setTimeout(() => {
  console.log('\nAPI Server is running. Starting the frontend application...\n');
  
  // Start the frontend application (vite dev server)
  const frontendApp = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle frontend errors
  frontendApp.on('error', (error) => {
    console.error(`Frontend application error: ${error.message}`);
    apiServer.kill();
    process.exit(1);
  });

  // Handle frontend exit
  frontendApp.on('close', (code) => {
    console.log(`Frontend application exited with code ${code}`);
    apiServer.kill();
    process.exit(code);
  });

}, 3000); // Wait 3 seconds for API server to start

// Handle API server errors
apiServer.on('error', (error) => {
  console.error(`API server error: ${error.message}`);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down ATS application...');
  apiServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down ATS application...');
  apiServer.kill();
  process.exit(0);
}); 