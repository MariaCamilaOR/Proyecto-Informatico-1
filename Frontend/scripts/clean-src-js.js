// Remove compiled .js and .js.map files inside src/ to avoid conflicts with TSX sources.
// Run with: node ./scripts/clean-src-js.js

const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const res = path.resolve(dir, d.name);
    if (d.isDirectory()) walk(res, cb);
    else cb(res);
  });
}

const root = path.resolve(__dirname, '..', 'src');
if (!fs.existsSync(root)) {
  console.error('No src/ folder found at', root);
  process.exit(1);
}

const removed = [];
walk(root, (file) => {
  if (file.endsWith('.js') || file.endsWith('.js.map')) {
    try {
      fs.unlinkSync(file);
      removed.push(file);
    } catch (e) {
      console.error('Failed to remove', file, e.message || e);
    }
  }
});

if (removed.length === 0) console.log('No compiled .js/.js.map files found under src/');
else {
  console.log('Removed compiled files:');
  removed.forEach((f) => console.log(' -', f));
}
