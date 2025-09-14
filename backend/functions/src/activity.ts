import express from "express";
import cors from "cors";
import {db} from "./config/firebase";

const activity = express();

activity.use(cors());
activity.use(express.json());

activity.get("/activities/:userId", async (req, res) => {
  try {
    const {userId} = req.params;

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

export default activity;
