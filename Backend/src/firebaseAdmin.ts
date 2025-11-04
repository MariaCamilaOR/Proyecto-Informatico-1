import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load env file (when running scripts like `set-claims` or dev tasks)
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Initialize Firebase Admin SDK using either a path to a service account
// JSON file (SERVICE_ACCOUNT_KEY_PATH) or raw JSON in SERVICE_ACCOUNT_KEY_JSON.
const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
const rawJson = process.env.SERVICE_ACCOUNT_KEY_JSON;

let credential: admin.ServiceAccount | undefined;

if (serviceAccountPath) {
  const resolved = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.join(process.cwd(), serviceAccountPath);
  // debug log
  // eslint-disable-next-line no-console
  console.log("[firebaseAdmin] loading service account from:", resolved);
  const content = fs.readFileSync(resolved, "utf8");
  credential = JSON.parse(content);
} else if (rawJson) {
  // eslint-disable-next-line no-console
  console.log("[firebaseAdmin] loading service account from SERVICE_ACCOUNT_KEY_JSON env");
  credential = JSON.parse(rawJson);
}

if (!admin.apps.length) {
  if (credential) {
    // eslint-disable-next-line no-console
    console.log("[firebaseAdmin] initializing admin SDK with service account, projectId=", credential.project_id || credential.projectId);
    // Determine storage bucket: prefer explicit env var, else fall back to <projectId>.appspot.com
    const saProjectId = (credential as any).project_id || (credential as any).projectId;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || (saProjectId ? `${saProjectId}.appspot.com` : undefined);
    // eslint-disable-next-line no-console
    console.log("[firebaseAdmin] using storage bucket:", bucketName || "<none>");
    admin.initializeApp({ credential: admin.credential.cert(credential), storageBucket: bucketName });
  } else {
    // Fall back to default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS env)
    // eslint-disable-next-line no-console
    console.log("[firebaseAdmin] initializing admin SDK with default credentials (no service account provided)");
    admin.initializeApp();
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();
export default admin;
