import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Carga .env.local desde /Backend (sirve en dev y en dist)
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Credenciales: por ruta o JSON inline
const serviceAccountPath = process.env.SERVICE_ACCOUNT_KEY_PATH;
const rawJson = process.env.SERVICE_ACCOUNT_KEY_JSON;

let credentialJson: Record<string, any> | undefined;

if (serviceAccountPath) {
  const resolved = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.join(process.cwd(), serviceAccountPath);
  // eslint-disable-next-line no-console
  console.log("[firebaseAdmin] loading service account from:", resolved);
  const content = fs.readFileSync(resolved, "utf8");
  credentialJson = JSON.parse(content);
} else if (rawJson) {
  // eslint-disable-next-line no-console
  console.log("[firebaseAdmin] loading service account from SERVICE_ACCOUNT_KEY_JSON env");
  credentialJson = JSON.parse(rawJson);
}

if (!admin.apps.length) {
  if (credentialJson) {
    const saProjectId = credentialJson["project_id"] || credentialJson["projectId"];
    const bucketName =
      process.env.FIREBASE_STORAGE_BUCKET ||
      (saProjectId ? `${saProjectId}.appspot.com` : undefined);

    // eslint-disable-next-line no-console
    console.log("[firebaseAdmin] initializing admin SDK with service account, projectId=", saProjectId);
    // eslint-disable-next-line no-console
    console.log("[firebaseAdmin] using storage bucket:", bucketName || "<none>");

    admin.initializeApp({
      credential: admin.credential.cert(credentialJson as admin.ServiceAccount),
      storageBucket: bucketName,
    });
  } else {
    // eslint-disable-next-line no-console
    console.log("[firebaseAdmin] initializing admin SDK with default credentials (no service account provided)");
    admin.initializeApp();
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export const storage = admin.storage();
export default admin;
