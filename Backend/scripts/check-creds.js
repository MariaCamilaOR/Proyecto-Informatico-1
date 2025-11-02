const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local if present
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const svcPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
const rawJson = process.env.SERVICE_ACCOUNT_KEY_JSON;
const googleEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

function fail(msg) {
  console.error('[check-creds] ERROR:', msg);
  console.error('[check-creds] Tip: put your service account JSON in Backend/keys and set SERVICE_ACCOUNT_KEY_PATH in Backend/.env.local');
  process.exit(1);
}

if (rawJson) {
  console.log('[check-creds] SERVICE_ACCOUNT_KEY_JSON is set (ok).');
  process.exit(0);
}

if (googleEnv) {
  if (fs.existsSync(googleEnv)) {
    console.log('[check-creds] GOOGLE_APPLICATION_CREDENTIALS points to file (ok).');
    process.exit(0);
  }
  fail(`GOOGLE_APPLICATION_CREDENTIALS is set but file not found: ${googleEnv}`);
}

if (svcPath) {
  const resolved = path.isAbsolute(svcPath) ? svcPath : path.join(process.cwd(), svcPath);
  if (fs.existsSync(resolved)) {
    console.log('[check-creds] SERVICE_ACCOUNT_KEY_PATH file found:', resolved);
    process.exit(0);
  }
  fail(`SERVICE_ACCOUNT_KEY_PATH file not found: ${resolved}`);
}

fail('No credentials found. Set SERVICE_ACCOUNT_KEY_PATH in Backend/.env.local or set GOOGLE_APPLICATION_CREDENTIALS or SERVICE_ACCOUNT_KEY_JSON.');
