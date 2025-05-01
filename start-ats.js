import { spawn, exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import net from 'net';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_PORT = 5000; // Backend API server port
const FRONTEND_PORT = 3000; // Frontend server port

// For debugging issues
const DEBUG = true;

console.log('Starting ATS Application...');

// Debug helper
function debug(...args) {
  if (DEBUG) {
    console.log('[DEBUG]', ...args);
  }
}

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
}

// Function to kill process running on a specific port (Windows and Unix compatible)
async function killProcessOnPort(port) {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      // For Windows
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error || !stdout) {
          console.log(`No process found running on port ${port}`);
          resolve();
          return;
        }

        // Parse out the PID from the output
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
          const pidMatch = lines[0].match(/(\d+)$/);
          if (pidMatch && pidMatch[1]) {
            const pid = pidMatch[1];
            console.log(`Killing process with PID ${pid} on port ${port}`);
            exec(`taskkill /F /PID ${pid}`, (err) => {
              if (err) {
                console.error(`Failed to kill process: ${err.message}`);
              } else {
                console.log(`Successfully killed process on port ${port}`);
              }
              resolve();
            });
          } else {
            console.log(`Could not identify PID for port ${port}`);
            resolve();
          }
        } else {
          resolve();
        }
      });
    } else {
      // For Unix-based systems
      exec(`lsof -i :${port} -t`, (error, stdout) => {
        if (error || !stdout) {
          console.log(`No process found running on port ${port}`);
          resolve();
          return;
        }

        const pid = stdout.trim();
        console.log(`Killing process with PID ${pid} on port ${port}`);
        exec(`kill -9 ${pid}`, (err) => {
          if (err) {
            console.error(`Failed to kill process: ${err.message}`);
          } else {
            console.log(`Successfully killed process on port ${port}`);
          }
          resolve();
        });
      });
    }
  });
}

// Function to check if API server is up and running
function isApiServerRunning() {
  return new Promise((resolve) => {
    console.log('Checking API server health...');
    const url = `http://localhost:${API_PORT}/health`;
    debug(`Sending GET request to ${url}`);

    const req = http.get(url, (res) => {
      let data = '';
      debug(`Response status code: ${res.statusCode}`);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        debug(`Response data: ${data}`);
        if (res.statusCode === 200) {
          console.log('API server is up and running');
          resolve(true);
        } else {
          console.log(`API health check returned status: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`API health check error: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('API health check timed out');
      req.destroy();
      resolve(false);
    });
  });
}

// Alternate function to check API server using curl
function checkWithCurl() {
  return new Promise((resolve) => {
    exec(
      'curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health',
      (error, stdout, stderr) => {
        if (error) {
          console.log(`Error running curl: ${error.message}`);
          resolve(false);
          return;
        }

        const statusCode = parseInt(stdout.trim(), 10);
        debug(`Curl request returned status: ${statusCode}`);

        if (statusCode === 200) {
          console.log('API server verified with curl');
          resolve(true);
        } else {
          console.log(`API health check with curl returned: ${statusCode}`);
          resolve(false);
        }
      }
    );
  });
}

// Function to wait for API server to be ready
async function waitForApiServer(maxAttempts = 30, interval = 2000) {
  console.log('Waiting for API server to be ready...');

  // Add initial delay to give the server time to initialize
  await new Promise((resolve) => setTimeout(resolve, 3000));

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Try with native http first
    if (await isApiServerRunning()) {
      console.log('API server health check successful');
      return true;
    }

    // If that fails, try with curl as a backup method
    if (await checkWithCurl()) {
      console.log('API server verified with curl');
      return true;
    }

    console.log(`API server not ready yet (attempt ${attempt + 1}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  console.error('Timed out waiting for API server to be ready');
  return false;
}

// Main function to orchestrate startup
async function startATS() {
  try {
    // Check and kill existing processes if needed
    if (await isPortInUse(API_PORT)) {
      console.log(`Port ${API_PORT} is already in use. Attempting to terminate the process...`);
      await killProcessOnPort(API_PORT);
      // Allow time for port to be released
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (await isPortInUse(FRONTEND_PORT)) {
      console.log(
        `Port ${FRONTEND_PORT} is already in use. Attempting to terminate the process...`
      );
      await killProcessOnPort(FRONTEND_PORT);
      // Allow time for port to be released
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Start the API server
    console.log('Starting API server...');
    const apiServer = spawn('node', ['src/server.js'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, DEBUG: 'express:*' }, // Add Express debugging
    });

    // Handle API server errors
    apiServer.on('error', (error) => {
      console.error(`API server error: ${error.message}`);
      process.exit(1);
    });

    // Wait for API server to be fully ready
    const apiReady = await waitForApiServer();
    if (!apiReady) {
      console.error('Failed to start API server properly. Exiting...');
      apiServer.kill();
      process.exit(1);
    }

    // Start the frontend application (vite dev server)
    console.log('Starting the frontend application...');
    const frontendApp = spawn('npm', ['run', 'dev', '--', '--port', FRONTEND_PORT], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, DEBUG: '*' }, // Add more debugging
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

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down ATS application...');
      apiServer.kill();
      frontendApp.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('Shutting down ATS application...');
      apiServer.kill();
      frontendApp.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting ATS application:', error);
    process.exit(1);
  }
}

// Start the application
startATS();
