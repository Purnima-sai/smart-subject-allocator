const { spawn } = require('child_process');
const path = require('path');

// Start the server
console.log('Starting server...');
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

// Give the server time to start
setTimeout(() => {
  console.log('Running integration tests...');
  const test = spawn('node', ['tests/integration_test.js'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  test.on('exit', (code) => {
    console.log(`Tests finished with code ${code}`);
    server.kill();
    process.exit(code);
  });
}, 3000);