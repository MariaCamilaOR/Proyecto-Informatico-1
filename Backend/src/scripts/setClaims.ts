import admin from "../firebaseAdmin";

async function main() {
  const uid = process.argv[2] || process.env.USER_UID;
  if (!uid) {
    console.error("Usage: npm run set-claims -- <uid> or set USER_UID env var");
    process.exit(1);
  }

  const claims = {
    role: process.env.CLAIM_ROLE || "patient",
    linkedPatientIds: (process.env.CLAIM_LINKED || "demo-patient-123").split(","),
  };

  try {
    // use the shared admin instance (firebaseAdmin.ts handles credential loading)
    await admin.auth().setCustomUserClaims(uid, claims as any);
    console.log(`Set claims for ${uid}:`, claims);
    process.exit(0);
  } catch (err) {
    console.error("Failed to set claims:", err);
    process.exit(1);
  }
}

main();
