import { spawn, exec } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Check if a process is running on a port and kill it if necessary
function checkAndKillPort(port) {
  return new Promise((resolve) => {
    console.log(`Checking port ${port}...`);

    if (process.platform === 'win32') {
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (!error && stdout) {
          const lines = stdout.trim().split('\n');
          if (lines.length > 0) {
            const pidMatch = lines[0].match(/(\d+)$/);
            if (pidMatch && pidMatch[1]) {
              const pid = pidMatch[1];
              console.log(`Killing process with PID ${pid} on port ${port}`);
              exec(`taskkill /F /PID ${pid}`, (err) => {
                if (err) console.error(`Failed to kill process: ${err.message}`);
                else console.log(`Killed process on port ${port}`);
                setTimeout(resolve, 1000); // Give it a moment
              });
              return;
            }
          }
        }
        resolve(); // No process or couldn't find PID
      });
    } else {
      // For Unix systems
      exec(`lsof -i :${port} -t`, (error, stdout) => {
        if (!error && stdout) {
          const pid = stdout.trim();
          console.log(`Killing process with PID ${pid} on port ${port}`);
          exec(`kill -9 ${pid}`, (err) => {
            if (err) console.error(`Failed to kill process: ${err.message}`);
            else console.log(`Killed process on port ${port}`);
            setTimeout(resolve, 1000); // Give it a moment
          });
          return;
        }
        resolve(); // No process
      });
    }
  });
}

// Health check to verify API is up and running
function checkAPIHealth(port, endpoint = '/health', maxRetries = 10, retryInterval = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0;

    function attemptConnection() {
      console.log(`Checking API health (attempt ${retries + 1}/${maxRetries})...`);

      const req = http.request(
        {
          hostname: 'localhost',
          port: port,
          path: endpoint,
          method: 'GET',
          timeout: 2000, // 2 second timeout
        },
        (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ API is healthy! (Status: ${res.statusCode})`);
            resolve(true);
          } else {
            console.log(`API health check returned status ${res.statusCode}, retrying...`);
            retryConnection();
          }
        }
      );

      req.on('error', (error) => {
        console.log(`API health check failed: ${error.message}`);
        retryConnection();
      });

      req.on('timeout', () => {
        console.log('API health check timed out');
        req.destroy();
        retryConnection();
      });

      req.end();
    }

    function retryConnection() {
      retries++;
      if (retries < maxRetries) {
        setTimeout(attemptConnection, retryInterval);
      } else {
        console.warn('⚠️ Max retries reached. Proceeding anyway but the API might not be ready.');
        resolve(false);
      }
    }

    attemptConnection();
  });
}

async function startApplication() {
  try {
    console.log('🚀 Starting ATS Application...');

    // Make sure ports are clear
    await checkAndKillPort(3001); // API Server
    await checkAndKillPort(3000); // Frontend

    // Start the backend server in one terminal
    console.log('📡 Starting API Server...');
    const apiProcess = spawn('node', ['src/server.js'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: 3001 }, // Explicitly set API server port
    });

    // Give the API server a moment to start and verify it's healthy
    console.log('⏳ Waiting for API Server to initialize...');
    let isApiHealthy = false;
    try {
      isApiHealthy = await checkAPIHealth(3001, '/api/health');
    } catch (error) {
      console.warn('API health check failed, but continuing startup process');
    }

    // Start the frontend in another terminal
    console.log('🖥️ Starting Frontend...');
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, BROWSER: 'none', VITE_API_URL: 'http://localhost:3001/api' }, // Set API URL for frontend
    });

    console.log('✅ ATS Application started!');
    console.log('🌐 API Server: http://localhost:3001');
    console.log('🌐 Frontend: http://localhost:3000');

    if (!isApiHealthy) {
      console.log('⚠️ API may not be fully initialized. Some features might not work immediately.');
    }

    console.log('📝 Press Ctrl+C to stop both servers');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('🛑 Shutting down ATS application...');
      apiProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

    // Handle errors
    apiProcess.on('error', (error) => {
      console.error(`API Server error: ${error.message}`);
      frontendProcess.kill();
      process.exit(1);
    });

    frontendProcess.on('error', (error) => {
      console.error(`Frontend error: ${error.message}`);
      apiProcess.kill();
      process.exit(1);
    });

    // If either process exits, shut everything down
    apiProcess.on('close', (code) => {
      console.log(`API Server exited with code ${code}`);
      frontendProcess.kill();
      process.exit(code || 0);
    });

    frontendProcess.on('close', (code) => {
      console.log(`Frontend exited with code ${code}`);
      apiProcess.kill();
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('Failed to start ATS application:', error);
    process.exit(1);
  }
}

startApplication();
