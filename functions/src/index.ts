import { onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Triggered when a document in the 'users' collection is deleted.
 * Deletes the corresponding record from Firebase Authentication.
 */
export const onuserdeleted = onDocumentDeleted("users/{userId}", async (event) => {
    const userId = event.params.userId;
    const snap = event.data;

    // If the data is missing, we can't extract email safeguard
    if (!snap) {
        console.log("No data found in event, skipping deletion.");
        return;
    }

    const userData = snap.data();
    
    // SAFEGUARD: Never delete the system admin by mistake
    if (userData?.email === 'admin@hospital.com') {
        console.log("Safeguard: Skipping Auth deletion for admin@hospital.com");
        return;
    }

    try {
        await admin.auth().deleteUser(userId);
        console.log(`Successfully deleted Auth user for UID: ${userId}`);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.log(`Auth user ${userId} already removed or never existed.`);
        } else {
            console.error(`Failed to delete Auth record for ${userId}:`, error);
        }
    }
});
