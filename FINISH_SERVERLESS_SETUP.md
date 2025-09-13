# Finish Serverless Setup Guide

This guide provides the remaining steps to complete the migration to Firebase Cloud Functions. Follow these in order. The backend is now ready for deployment—your Express app is adapted as a serverless function named `api`, which handles routes like `/health` and `/test-firestore` under the function's base URL (e.g., `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`).

## Prerequisites
- Firebase CLI installed globally (`npm install -g firebase-tools` if not already).
- Authenticated to Firebase (`firebase login`).
- Your Firebase project configured in `.firebaserc` (should point to the correct project ID).
- Environment variables set in the Firebase Console:
  - Go to Firebase Console > Functions > Config (or use `firebase functions:config:set` CLI).
  - Set keys like `firebase.project_id="your-project-id"`, `firebase.private_key_id="..."`, etc., based on your service account. For security, use Firebase's built-in Admin SDK initialization instead of manual service account if possible—update `functions/src/config/firebase.ts` to `admin.initializeApp();` if your project allows default auth.
- Node.js v18+ (your setup uses v22 engines, but v24 is fine despite warnings).

## Step 1: Install Dependencies (If Not Done)
Run this to ensure all packages (including express and cors) are installed in the functions directory:
```
cd backend/functions
npm install
```
(Already executed successfully; ignore deprecation warnings for ESLint v8—it's harmless for now.)

## Step 2: Deploy the Functions
Deploy only the functions to Firebase Cloud Functions. This will build the TypeScript code (via `npm run build`) and upload to your project.
```
cd backend
firebase deploy --only functions
```
- Expected output: Function `api` deployed with a URL like `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`.
- If errors:
  - Check logs: `firebase functions:log`.
  - Ensure your service account has Firestore access (default for Firebase projects).
  - If env vars are missing, set them via CLI: `firebase functions:config:set firebase.project_id="your-id" firebase.private_key="your-key-replaced-n" ...` (escape newlines).
- Region: Defaults to `us-central1`; specify `--region your-region` if needed.

## Step 3: Test the Deployed Endpoints
Once deployed, test the endpoints using curl or a browser/Postman. Replace `YOUR_FUNCTION_URL` with the actual URL from deployment output (e.g., `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`).

- Health check (GET):
  ```
  curl YOUR_FUNCTION_URL/health
  ```
  Expected: `{"status":"OK","message":"Backend server is running!"}`

- Firestore test (GET):
  ```
  curl YOUR_FUNCTION_URL/test-firestore
  ```
  Expected: `{"success":true,"message":"Firestore connection successful","documentsCount":X}` (X is the number of docs in 'test' collection; create one if zero).

- If CORS issues: The app has `cors()` middleware, so it should allow `*` origins. For production, tighten to your frontend domain.

- Monitor invocation: Check Firebase Console > Functions > Logs for errors (e.g., Firestore permission denied).

## Step 4: Update Frontend to Use New URLs
The frontend currently likely calls `localhost:3001`. Update to the deployed function URL.

- Locate API calls in frontend (e.g., in `src/pages/` or hooks like `useAuth.ts`—use codebase_search for "fetch" or "axios" if needed).
- Replace base URL, e.g.:
  ```typescript
  const API_BASE = 'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api';
  fetch(`${API_BASE}/health`);
  ```
- If using environment vars: Add to `frontend/.env` or `vite.config.ts`.
- For production: Use Firebase Hosting for frontend (`firebase deploy --only hosting`) to get a unified domain like `your-app.web.app`, proxying `/api/*` to functions.
- Test end-to-end: Run frontend (`cd frontend && npm run dev`), call the endpoints, verify responses.

## Step 5: Security and Optimization (Optional but Recommended)
- **Auth**: Add Firebase Auth middleware if routes need protection (e.g., `admin.auth().verifyIdToken(token)`).
- **Env Vars**: Migrate to Firebase config: `functions.config().firebase.project_id`.
- **Costs**: Monitor in Firebase Console; free tier covers ~125k invocations/month.
- **Cold Starts**: v2 functions (used here) minimize latency; test with tools like Artillery.
- **Rollback**: If issues, `firebase deploy --only functions` with old code or delete: `firebase functions:delete api`.

## Troubleshooting
- Deployment fails on build: Run `cd backend/functions && npm run build` locally; fix TS errors (e.g., add `@types/express` if needed: `npm i -D @types/express @types/cors`).
- Firestore errors: Ensure default service account has `datastore.user` role in IAM.
- No URL output: Check `firebase functions:list`.

After these steps, the serverless backend is live! If you encounter errors, share logs for debugging.