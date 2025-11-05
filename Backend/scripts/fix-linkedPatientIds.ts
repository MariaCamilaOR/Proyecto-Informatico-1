import admin, { firestore } from "../src/firebaseAdmin";

async function main() {
  console.log("Starting migration: fix-linkedPatientIds");
  const usersRef = firestore.collection("users");
  const snapshot = await usersRef.get();

  let total = 0;
  let fixed = 0;
  const now = new Date().toISOString();

  for (const doc of snapshot.docs) {
    total += 1;
    const id = doc.id;
    const data: any = doc.data();
    const role = (data.role || "").toString().toLowerCase();
    const linked: string[] = Array.isArray(data.linkedPatientIds) ? data.linkedPatientIds : [];

    // Only consider non-patient roles that have linkedPatientIds containing their own uid
    if (role === "patient") continue;
    if (!linked || linked.length === 0) continue;
    if (!linked.includes(id)) continue;

    console.log(`Found self-referential linkedPatientIds for user ${id} (role=${role})`);

    // Backup original user doc into a migration_backups subcollection
    try {
      const backupRef = usersRef.doc(id).collection("migration_backups").doc(now);
      await backupRef.set({
        backedUpAt: admin.firestore.FieldValue.serverTimestamp(),
        original: data,
        reason: "remove_self_from_linkedPatientIds",
      });
    } catch (err) {
      console.error(`Failed to write backup for ${id}:`, err);
      // continue anyway
    }

    // Compute new linkedPatientIds (remove self)
    const newLinked = linked.filter((x) => x !== id);

    // Prepare update object
    const updateObj: any = {};
    if (newLinked.length > 0) {
      updateObj.linkedPatientIds = newLinked;
    } else {
      // Remove the field by setting to admin.firestore.FieldValue.delete()
      updateObj.linkedPatientIds = admin.firestore.FieldValue.delete();
    }

    try {
      await usersRef.doc(id).set(updateObj, { merge: true });
      console.log(`Updated user ${id}: removed self from linkedPatientIds (now ${newLinked.length} entries)`);
      fixed += 1;
    } catch (err) {
      console.error(`Failed to update user ${id}:`, err);
      continue;
    }

    // Update custom claims if they exist
    try {
      const authUser = await admin.auth().getUser(id);
      const existingClaims = authUser.customClaims || {};
      let updatedClaims = { ...existingClaims };

      if (Array.isArray(existingClaims.linkedPatientIds)) {
        const claimsLinked: string[] = existingClaims.linkedPatientIds as any;
        const newClaimsLinked = claimsLinked.filter((x) => x !== id);
        if (newClaimsLinked.length > 0) {
          updatedClaims.linkedPatientIds = newClaimsLinked;
        } else {
          delete updatedClaims.linkedPatientIds;
        }
      }

      // Only set claims if they changed
      const claimsChanged = JSON.stringify(existingClaims) !== JSON.stringify(updatedClaims);
      if (claimsChanged) {
        await admin.auth().setCustomUserClaims(id, updatedClaims);
        console.log(`Updated custom claims for ${id}`);
      }
    } catch (err) {
      console.error(`Failed to update custom claims for ${id}:`, err);
    }
  }

  console.log(`Migration finished. Scanned ${total} users, fixed ${fixed} users.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
