/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";  // Use v2 for better performance
import {setGlobalOptions} from "firebase-functions/v2/options";
import * as logger from "firebase-functions/logger";

import app from './app';

// Set global options
setGlobalOptions({ maxInstances: 10 });

export const api = onRequest(app);
