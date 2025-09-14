import express from "express";
import {db} from "./config/firebase";

const router = express.Router();

router.post("/activities", async (req, res) => {
    try {
        const { activityName, color, websiteLink, canvasContent, userId } = req.body;

        if (!activityName || !userId) {
            return res.status(400).json({
                success: false,
                message: "Activity name and user ID are required",
            });
        }

        const newActivityData = {
            activityName,
            color,
            websiteLink: websiteLink || "",
            canvasContent: canvasContent || "",
            userId,
        };

        const docRef = await db.collection("activities").add(newActivityData);

        return res.status(201).json({
            success: true,
            message: "Activity added successfully",
            activity: { id: docRef.id, ...newActivityData },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add activity",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

router.get("/activities/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const activitiesCollection = db.collection("activities");
    const snapshot = await activitiesCollection.where(
      "userId", "==", userId
    ).get();

    const activities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      message: "User activities retrieved successfully",
      activities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user activities",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.delete("/activities/:activityId", async (req, res) => {
    try {
        const { activityId } = req.params;

        if (!activityId) {
            return res.status(400).json({
                success: false,
                message: "Activity ID is required",
            });
        }

        await db.collection("activities").doc(activityId).delete();

        return res.status(200).json({
            success: true,
            message: "Activity deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete activity",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;