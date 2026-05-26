const { spawn } = require('child_process');
const path = require('path');

// Clone environment and forcibly remove the offending variable
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

console.log('Starting Electron with stripped environment...');

const electronPath = require('electron'); // This gets the path from the local node_modules
const child = spawn(electronPath, ['.'], { 
  env, 
  stdio: 'inherit',
  windowsHide: false
});

child.on('close', (code) => {
  process.exit(code);
});
