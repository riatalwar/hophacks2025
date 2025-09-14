import express from "express";
import {db} from "./config/firebase";

const router = express.Router();

// GET /preferences/:userId - Retrieve user's preferences
router.get("/preferences/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const preferencesCollection = db.collection("preferences");
        const snapshot = await preferencesCollection.where(
            "userId", "==", userId
        ).get();

        if (snapshot.empty) {
            // Return default preferences if none exist
            const defaultPreferences = {
                wakeUpTimes: [0, 0, 0, 0, 0, 0, 0],
                bedtimes: [0, 0, 0, 0, 0, 0, 0],
                busyTimes: [
                    { head: null, size: 0 }, // Monday
                    { head: null, size: 0 }, // Tuesday
                    { head: null, size: 0 }, // Wednesday
                    { head: null, size: 0 }, // Thursday
                    { head: null, size: 0 }, // Friday
                    { head: null, size: 0 }, // Saturday
                    { head: null, size: 0 }  // Sunday
                ],
                studyReminders: true,
                assignmentDeadlines: true,
                weeklyDigest: true,
                courseUpdates: true,
                systemAlerts: true,
                shareDataAnonymously: false,
                isDarkMode: true,
                accentColor: '#4ecdc4'
            };

            return res.json({
                success: true,
                message: "Default preferences returned (no user preferences found)",
                preferences: defaultPreferences,
            });
        }

        const preferences = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return res.json({
            success: true,
            message: "User preferences retrieved successfully",
            preferences: preferences[0], // Return the first (and should be only) preferences document
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user preferences",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// POST /preferences - Create or update user preferences
router.post("/preferences", async (req, res) => {
    try {
        const { 
            wakeUpTimes, 
            bedtimes, 
            busyTimes, 
            studyReminders, 
            assignmentDeadlines, 
            weeklyDigest, 
            courseUpdates, 
            systemAlerts, 
            shareDataAnonymously, 
            isDarkMode, 
            accentColor, 
            userId 
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const preferencesData = {
            wakeUpTimes: wakeUpTimes || [0, 0, 0, 0, 0, 0, 0],
            bedtimes: bedtimes || [0, 0, 0, 0, 0, 0, 0],
            busyTimes: busyTimes || [
                { head: null, size: 0 }, // Monday
                { head: null, size: 0 }, // Tuesday
                { head: null, size: 0 }, // Wednesday
                { head: null, size: 0 }, // Thursday
                { head: null, size: 0 }, // Friday
                { head: null, size: 0 }, // Saturday
                { head: null, size: 0 }  // Sunday
            ],
            studyReminders: studyReminders !== undefined ? studyReminders : true,
            assignmentDeadlines: assignmentDeadlines !== undefined ? assignmentDeadlines : true,
            weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : true,
            courseUpdates: courseUpdates !== undefined ? courseUpdates : true,
            systemAlerts: systemAlerts !== undefined ? systemAlerts : true,
            shareDataAnonymously: shareDataAnonymously !== undefined ? shareDataAnonymously : false,
            isDarkMode: isDarkMode !== undefined ? isDarkMode : true,
            accentColor: accentColor || '#4ecdc4',
            userId,
            lastUpdated: new Date().toISOString(),
        };

        // Check if preferences already exist for this user
        const preferencesCollection = db.collection("preferences");
        const existingSnapshot = await preferencesCollection.where("userId", "==", userId).get();

        let result;
        if (existingSnapshot.empty) {
            // Create new preferences document
            const docRef = await preferencesCollection.add(preferencesData);
            result = { id: docRef.id, ...preferencesData };
        } else {
            // Update existing preferences document
            const existingDoc = existingSnapshot.docs[0];
            await existingDoc.ref.update(preferencesData);
            result = { id: existingDoc.id, ...preferencesData };
        }

        return res.status(201).json({
            success: true,
            message: "Preferences saved successfully",
            preferences: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to save preferences",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// PUT /preferences/:userId - Update user preferences (alternative to POST)
router.put("/preferences/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const preferencesData = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        // Add timestamp and userId to the data
        const updateData = {
            ...preferencesData,
            userId,
            lastUpdated: new Date().toISOString(),
        };

        // Check if preferences exist for this user
        const preferencesCollection = db.collection("preferences");
        const existingSnapshot = await preferencesCollection.where("userId", "==", userId).get();

        if (existingSnapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "Preferences not found for this user",
            });
        }

        // Update existing preferences
        const existingDoc = existingSnapshot.docs[0];
        await existingDoc.ref.update(updateData);

        return res.status(200).json({
            success: true,
            message: "Preferences updated successfully",
            preferences: { id: existingDoc.id, ...updateData },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update preferences",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

// DELETE /preferences/:userId - Delete user preferences
router.delete("/preferences/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const preferencesCollection = db.collection("preferences");
        const snapshot = await preferencesCollection.where("userId", "==", userId).get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "Preferences not found for this user",
            });
        }

        // Delete all preference documents for this user (should only be one)
        const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        return res.status(200).json({
            success: true,
            message: "Preferences deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete preferences",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
