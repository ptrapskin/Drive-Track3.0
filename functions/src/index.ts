
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// This function allows a student to invite a guardian.
// It looks up the guardian's email to find their UID and then creates an invite document.
export const inviteGuardian = onCall(async (request) => {
    if (!request.auth) {
        throw new Error("Authentication required.");
    }

    const studentUid = request.auth.uid;
    const studentEmail = request.auth.token.email;
    const studentName = request.auth.token.name || studentEmail?.split("@")[0];
    const guardianEmail = request.data.guardianEmail;

    if (!guardianEmail) {
        throw new Error("Guardian email is required.");
    }

    logger.info(`Student ${studentUid} is inviting guardian ${guardianEmail}`);

    try {
        // Find the guardian user by their email address.
        const guardianUserRecord = await admin.auth().getUserByEmail(guardianEmail);
        const guardianUid = guardianUserRecord.uid;

        // Create or update the guardian's invite document.
        const inviteRef = db.collection("guardianInvites").doc(guardianUid);
        await inviteRef.set({
            students: {
                [studentUid]: {
                    name: studentName,
                    email: studentEmail,
                },
            },
        }, { merge: true });

        logger.info(`Successfully created/updated invite for guardian ${guardianUid} from student ${studentUid}`);
        return { success: true, message: "Invitation sent successfully." };

    } catch (error: any) {
        logger.error("Error in inviteGuardian function:", error);
        if (error.code === "auth/user-not-found") {
            return { success: false, error: "Guardian email not found. Please ensure they have an account." };
        }
        return { success: false, error: "An unexpected error occurred." };
    }
});
    