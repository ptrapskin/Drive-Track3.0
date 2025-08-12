
import * as admin from "firebase-admin";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

admin.initializeApp();
const db = admin.firestore();

// Function to create an invitation
export const createInvite = onCall(async (request) => {
  const {studentEmail, guardianEmail} = request.data;
  if (!studentEmail || !guardianEmail) {
    throw new HttpsError(
        "invalid-argument",
        "Missing studentEmail or guardianEmail",
    );
  }

  // Find student user doc to get their familyId
  const studentQuery = await db.collection("users")
      .where("email", "==", studentEmail).limit(1).get();
  if (studentQuery.empty) {
    throw new HttpsError("not-found", "Student user not found.");
  }
  const studentDoc = studentQuery.docs[0];
  const familyId = studentDoc.data().familyId;

  if (!familyId) {
    throw new HttpsError("failed-precondition", "Student has no familyId.");
  }

  // Create an invite document
  await db.collection("invites").add({
    studentEmail,
    guardianEmail,
    familyId,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  logger.info(`Invite created for ${guardianEmail} to join ${studentEmail}'s family.`);
  return {success: true};
});


// Function to be called when a new user signs up or an existing user logs in.
// It checks for pending invites for that user's email.
export const processInvite = onCall(async (request) => {
  const userEmail = request.data.email;
  const user = await admin.auth().getUserByEmail(userEmail);
  const uid = user.uid;

  if (!userEmail) {
    throw new HttpsError("invalid-argument", "Missing user email.");
  }

  const invitesQuery = await db.collection("invites")
      .where("guardianEmail", "==", userEmail)
      .where("status", "==", "pending")
      .get();

  if (invitesQuery.empty) {
    // This is not an error, it just means there are no pending invites.
    // We can return a success message indicating this.
    return {success: true, message: "No pending invites for this user."};
  }

  const batch = db.batch();

  invitesQuery.docs.forEach((inviteDoc) => {
    const inviteData = inviteDoc.data();
    const familyId = inviteData.familyId;

    // Update the guardian's user document with the student's familyId
    const guardianUserRef = db.collection("users").doc(uid);
    batch.set(guardianUserRef, {familyId: familyId}, {merge: true});

    // Mark the invite as accepted
    batch.update(inviteDoc.ref, {status: "accepted", acceptedAt: admin.firestore.FieldValue.serverTimestamp()});

    logger.info(`User ${uid} accepted invite and joined family ${familyId}`);
  });

  await batch.commit();

  return {success: true, message: "Invites processed."};
});
