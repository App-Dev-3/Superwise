#!/usr/bin/env node

const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

// Arguments passed to this script (e.g., username, password)
// process.argv[0] is node executable, process.argv[1] is the script file
const args = process.argv.slice(2);

const scriptDir = __dirname;
let scriptPath = '';
let shell = false; // Set to true for Windows .bat files

console.log('Determining platform and selecting setup script...');

if (os.platform() === 'win32') {
  console.log('Platform: Windows');
  scriptPath = path.join(scriptDir, 'db_setup.bat');
  shell = true;
} else {
  // Assume Unix-like (macOS, Linux)
  console.log(`Platform: ${os.platform()}`);
  scriptPath = path.join(scriptDir, 'db_setup.sh');
  shell = false; // .sh scripts can be executed directly if executable
}

console.log(`Executing script: ${scriptPath} with arguments: ${args.join(' ')}`);

const setupProcess = spawn(scriptPath, args, {
  stdio: 'inherit', // Pass parent's stdio to the child, so we see the output/errors
  shell: shell,
});

setupProcess.on('close', (code) => {
  console.log(`Setup script finished with code ${code}`);
  if (code !== 0) {
    console.error('Database setup script failed. Please check the output above for errors.');
    process.exit(code);
  } else {
    console.log('Database setup script completed successfully (or reported success).');
    if (os.platform() === 'win32') {
        console.log('\n*** REMEMBER TO MANUALLY UPDATE .env ON WINDOWS! ***\n');
    }
    process.exit(0);
  }
});

setupProcess.on('error', (err) => {
  console.error('Failed to start setup script:', err);
  process.exit(1);
}); 