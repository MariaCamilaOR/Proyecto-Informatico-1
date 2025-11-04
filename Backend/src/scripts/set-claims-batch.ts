import admin from "../firebaseAdmin";
import fs from "fs";
import path from "path";

async function main() {
  const fp = process.argv[2];
  if (!fp) {
    console.error("Usage: ts-node-dev src/scripts/set-claims-batch.ts <file.json|file.csv>");
    process.exit(1);
  }

  const resolved = path.isAbsolute(fp) ? fp : path.join(process.cwd(), fp);
  if (!fs.existsSync(resolved)) {
    console.error("File not found:", resolved);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolved, "utf8");
  let entries: Array<{ uid: string; patientId: string }> = [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      entries = parsed.map((p: any) => ({ uid: String(p.uid), patientId: String(p.patientId) }));
    } else {
      console.error("JSON must be an array of { uid, patientId }");
      process.exit(1);
    }
  } catch (e) {
    // try CSV: uid,patientId
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    entries = lines.map((l) => {
      const [uid, patientId] = l.split(",").map((s) => s.trim());
      return { uid, patientId } as any;
    });
  }

  console.log(`Setting claims for ${entries.length} entries from ${resolved}`);
  let success = 0;
  for (const e of entries) {
    if (!e.uid || !e.patientId) {
      console.warn("Skipping invalid entry", e);
      continue;
    }
    try {
      await admin.auth().setCustomUserClaims(e.uid, { role: "patient", linkedPatientIds: [e.patientId] });
      console.log(`OK: ${e.uid} -> ${e.patientId}`);
      success++;
    } catch (err: any) {
      console.error(`FAILED: ${e.uid} -> ${e.patientId}`, err?.message || err);
    }
  }

  console.log(`Finished: ${success}/${entries.length} succeeded`);
  process.exit(0);
}

main();
