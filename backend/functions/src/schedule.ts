import express from "express";
import {db} from "./config/firebase";

const router = express.Router();

router.get("/schedules/:userId", async (req, res) => {
  try {
    const {userId} = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const schedulesCollection = db.collection("schedules");
    const snapshot = await schedulesCollection.where(
        "userId", "==", userId
      ).get();

    const schedules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      message: "User schedules retrieved successfully",
      schedules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user schedules",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;