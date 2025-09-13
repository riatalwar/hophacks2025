import admin from "firebase-admin";

if (!admin.apps.length) {
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    // Local emulator: No creds needed
    admin.initializeApp();
  } else {
    // Prod: Use firebase project id
    admin.initializeApp({
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    });
  }
}


export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
