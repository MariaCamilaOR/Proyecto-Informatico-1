import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env.local so SERVICE_ACCOUNT_KEY_PATH etc. are available when running the script
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

async function main() {
  // Load service account from env or default path
  const svcPath = process.env.SERVICE_ACCOUNT_KEY_PATH || "./keys/service-account.json";
  let credential: any = undefined;
  if (fs.existsSync(svcPath)) {
    credential = require(path.resolve(svcPath));
  }

  if (credential) {
    admin.initializeApp({ credential: admin.credential.cert(credential) });
  } else {
    // Fallback to default
    admin.initializeApp();
  }

  const uid = process.argv[2] || process.env.USER_UID;
  if (!uid) {
    console.error("Usage: node setClaims.js <uid> or set USER_UID env var");
    process.exit(1);
  }

  // Example claims - change as needed
  const claims = {
    role: process.env.CLAIM_ROLE || "patient",
    linkedPatientIds: (process.env.CLAIM_LINKED || "demo-patient-123").split(",")
  };

  await admin.auth().setCustomUserClaims(uid, claims as any);
  console.log(`Set claims for ${uid}:`, claims);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
