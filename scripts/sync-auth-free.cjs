/**
 * 🛠️ MediCare FREE Auth Sync Script (CommonJS version)
 * Run this locally from your terminal to purge users from Firebase Authentication
 * that no longer exist in your Firestore database.
 *
 * SETUP:
 * 1. Go to Firebase Console → Project Settings → Service Accounts.
 * 2. Click "Generate new private key" → Save it as 'service-account.json'
 *    either in the project root or in the 'scripts' folder.
 * 3. Run: node scripts/sync-auth-free.cjs
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Resolve service account location (root or scripts folder)
const rootPath = path.resolve(__dirname, '../service-account.json');
const scriptsPath = path.resolve(__dirname, './service-account.json');
const serviceAccountPath = fs.existsSync(scriptsPath) ? scriptsPath : rootPath;

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Error: 'service-account.json' missing.");
  console.log("Generate it from Firebase Console → Service Accounts and place it in the project root or scripts folder.");
  process.exit(1);
}

console.log(`📂 Using credentials from: ${serviceAccountPath}`);
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Explicit project ID to avoid any ambiguity when using the Admin SDK
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();
const auth = admin.auth();

async function syncAuth() {
  console.log("🚀 Starting Free Auth Sync...");
  try {
    const listUsersResult = await auth.listUsers();
    const authUsers = listUsersResult.users;
    console.log(`Found ${authUsers.length} users in Firebase Authentication.`);
    let deletedCount = 0;

    for (const authUser of authUsers) {
      if (authUser.email === 'admin@hospital.com') {
        console.log(`- Skipping protected admin: ${authUser.email}`);
        continue;
      }

      // Fetch the corresponding Firestore document, handling NOT_FOUND gracefully
      let userDoc;
      try {
        userDoc = await db.collection('users').doc(authUser.uid).get();
      } catch (e) {
        if (e.code === 5) { // NOT_FOUND
          console.warn(`⚠️ Firestore doc not found for UID ${authUser.uid}, treating as orphan.`);
          userDoc = { exists: false };
        } else {
          console.error(`❌ Error fetching Firestore doc for UID ${authUser.uid}:`, e);
          continue;
        }
      }

      if (!userDoc.exists || (userDoc.data && userDoc.data().deleted === true)) {
        console.log(`- Deleting orphaned Auth user: ${authUser.email} (UID: ${authUser.uid})`);
        await auth.deleteUser(authUser.uid);
        deletedCount++;
      }
    }

    console.log(`\n✅ Sync Complete!`);
    console.log(`Removed ${deletedCount} orphaned authentication records.`);
  } catch (error) {
    console.error("❌ Sync Failed:", error);
  }
}

syncAuth();
