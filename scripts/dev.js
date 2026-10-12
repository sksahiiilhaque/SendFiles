import { spawn } from 'node:child_process';
import path from 'node:path';

console.log('🚀 Starting SendFiles Full-Stack Development Environment...');

// Start Backend Server
const serverProcess = spawn('node', ['server/src/server.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start Frontend Vite Server
const clientProcess = spawn('npm', ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\n🛑 Shutting down SendFiles dev services...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
