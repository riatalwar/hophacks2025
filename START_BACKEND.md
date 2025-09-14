# Starting the Backend Server

To fix the "failed to fetch" error, you need to start the backend server first.

## Quick Start

1. **Navigate to the backend directory:**
   ```bash
   cd backend/functions
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the Firebase emulator:**
   ```bash
   npm run serve
   ```

4. **The API will be available at:**
   ```
   http://localhost:5001/hophacks2025/us-central1/api
   ```

## What This Does

- Starts the Firebase Functions emulator
- Compiles TypeScript to JavaScript
- Makes the API endpoints available locally
- Enables the Preferences page to save/load data

## Alternative Commands

- `npm run build` - Just compile TypeScript
- `npm run build:watch` - Watch mode for development
- `firebase emulators:start --only functions` - Direct Firebase command

## Troubleshooting

If you still get "failed to fetch" errors:

1. **Check if the server is running:**
   - Look for "Functions emulator started" in the terminal
   - Visit http://localhost:5001/hophacks2025/us-central1/api/health

2. **Check the console:**
   - Open browser dev tools
   - Look for API request logs and error messages

3. **Verify Firebase project:**
   - Make sure you're in the correct Firebase project
   - Check that `.firebaserc` has the right project ID

## Expected Output

When the server starts successfully, you should see:
```
✔  functions: Using node@22 from host.
✔  functions: Loaded environment variables from .env.
✔  functions: Emulator started at http://localhost:5001
```

The Preferences page will then work without "failed to fetch" errors!
