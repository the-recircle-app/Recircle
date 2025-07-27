// Windows-compatible startup script
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment
process.env.NODE_ENV = 'development';

console.log('Starting ReCircle on Windows...');
console.log('Backend + Frontend will be available at:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend API: http://localhost:5000');

// Start the server
import('./server/index.ts')
  .then(() => {
    console.log('ReCircle started successfully!');
  })
  .catch((error) => {
    console.error('Failed to start ReCircle:', error);
    process.exit(1);
  });