import express from "express";
import { db } from "./config/firebase";

const router = express.Router();

// Get user preferences
router.get("/preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const preferencesDoc = await db.collection("preferences").doc(userId).get();

    if (!preferencesDoc.exists) {
      return res.json({
        success: true,
        message: "No preferences found for user",
        preferences: null,
      });
    }

    const preferences = preferencesDoc.data();

    return res.json({
      success: true,
      message: "User preferences retrieved successfully",
      preferences,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user preferences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Save/update user preferences
router.post("/preferences", async (req, res) => {
  try {
    const { 
      userId,
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
      accentColor
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const preferencesData = {
      userId,
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
      weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : false,
      courseUpdates: courseUpdates !== undefined ? courseUpdates : true,
      systemAlerts: systemAlerts !== undefined ? systemAlerts : true,
      shareDataAnonymously: shareDataAnonymously !== undefined ? shareDataAnonymously : false,
      isDarkMode: isDarkMode !== undefined ? isDarkMode : true,
      accentColor: accentColor || '#4ecdc4',
      updatedAt: new Date().toISOString(),
    };

    await db.collection("preferences").doc(userId).set(preferencesData, { merge: true });

    return res.status(200).json({
      success: true,
      message: "Preferences saved successfully",
      preferences: preferencesData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save preferences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update specific preference field
router.patch("/preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Add timestamp to update
    updateData.updatedAt = new Date().toISOString();

    await db.collection("preferences").doc(userId).set(updateData, { merge: true });

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: updateData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update preferences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
