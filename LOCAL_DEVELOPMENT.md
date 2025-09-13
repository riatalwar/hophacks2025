# Local Development Guide

This guide explains how to set up and run the project locally for backend (Firebase Cloud Functions emulator) and frontend (Vite). No Firebase project access required for basic dev/testing—use emulators for offline simulation. Assumes Git clone and VS Code.

## Prerequisites
- Node.js v18+ (LTS recommended).
- Firebase CLI: `npm install -g firebase-tools`.
- PNPM for frontend: `npm install -g pnpm`.

## Backend: Run Firebase Emulators
The backend uses Firebase Cloud Functions (serverless). Emulate locally for API testing.

1. Install deps:
   ```
   cd backend/functions
   npm install
   npm run build
   ```
<!-- 
2. Configure dummy project (edit `backend/.firebaserc` if needed):
   ```
   {
     "projects": {
       "default": "local-emulator-project"
     }
   }
   ``` -->

3. Start emulators (Functions + Firestore):
   ```
   cd backend
   firebase emulators:start --only functions,firestore
   ```
   - Functions URL: `http://localhost:5001/local-emulator-project/us-central1/api` (e.g., `/health` route: `localhost:5001/local-emulator-project/us-central1/api/health`).
   - Firestore UI: `http://localhost:4000` (add/view data in 'test' collection).
   - Auto-reloads on code changes in `backend/functions/src/`.
   - Stop: Ctrl+C.

<!-- 4. Test API:
   ```
   curl "http://localhost:5001/local-emulator-project/us-central1/api/health"
   # Expected: {"status":"OK","message":"Backend server is running!"}
   ``` -->
4. Test API:
   ```
   curl "http://localhost:5001/hophacks2025/us-central1/api/health"
   # Expected: {"status":"OK","message":"Backend server is running!"}
   ```

- Logs: In emulator terminal.

## Frontend: Run Vite Dev Server
1. Install deps:
   ```
   cd frontend
   pnpm install
   ```

2. Run dev server:
   ```
   pnpm run dev
   ```
   - Opens `http://localhost:5173`.

## Troubleshooting
- Port conflict: Add `--port 5002` to emulators.
- TS errors: `cd backend/functions && npm run build`.
- No data in Firestore: Use emulator UI (`localhost:4000`).
- Env issues: Hardcode dummies in `firebase.ts` for local.