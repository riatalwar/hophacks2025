import { Router } from "express";
import { db } from "../config/firebase";
import { TodoItem } from "../../../shared/types/tasks";
import { TimeBlock } from "../../../frontend/src/types/scheduling";
import { generateSchedule } from "../../../frontend/src/utils/schedulingUtils";

const router = Router();

/**
 * POST /api/schedule/:userId/generate
 * Generates schedule for the given user and stores it in Firestore.
 */
router.post("/api/schedule/:userId/generate", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch user's todo items
    const todoSnapshot = await db
      .collection("todoItems")
      .where("userId", "==", userId)
      .get();

    const todoItems: TodoItem[] = [];
    todoSnapshot.forEach((doc) => {
      const item = doc.data();
      // Assume type safety at MVP level
      todoItems.push(item as TodoItem);
    });

    // Fetch user's time blocks
    const timeBlockSnapshot = await db
      .collection("timeBlocks")
      .where("userId", "==", userId)
      .get();

    const timeBlocks: TimeBlock[] = [];
    timeBlockSnapshot.forEach((doc) => {
      const item = doc.data();
      timeBlocks.push(item as TimeBlock);
    });

    // Generate schedule
    const generatedSchedule = generateSchedule(todoItems, timeBlocks);

    // Store generated schedule in Firestore
    await db
      .collection("generatedSchedules")
      .doc(userId)
      .set({ userId, generatedSchedule, createdAt: new Date().toISOString() });

    // Return generated schedule
    return res.status(201).json({
      success: true,
      schedule: generatedSchedule,
    });
  } catch (error) {
    console.error("Error generating schedule:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate schedule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;