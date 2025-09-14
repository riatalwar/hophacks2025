import express from "express";
import {db} from "../config/firebase";
import {Schedule, TimeBlock} from "@shared/types";

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * POST /schedules
 * Create or update a user's schedule
 * Body: { userId: string, timeBlocks: TimeBlock[] }
 */
router.post("/", async (req, res) => {
  try {
    const {userId, timeBlocks} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!Array.isArray(timeBlocks)) {
      return res.status(400).json({
        success: false,
        message: "Time blocks must be an array",
      });
    }

    // Convert timeBlocks array to a map for internal storage
    const timeBlocksMap: { [timeBlockId: string]: TimeBlock } = {};
    timeBlocks.forEach((timeBlock: TimeBlock) => {
      if (!timeBlock.id) {
        throw new Error("Each time block must have an ID");
      }
      timeBlocksMap[timeBlock.id] = timeBlock;
    });

    const scheduleData: Schedule = {
      userId,
      timeBlocks: timeBlocksMap,
    };

    const scheduleRef = db.collection("schedules").doc(userId);
    const existingSchedule = await scheduleRef.get();

    if (existingSchedule.exists) {
      // Update existing schedule - merge with existing time blocks
      const existingData = existingSchedule.data() as Schedule;
      const mergedTimeBlocks = {
        ...existingData.timeBlocks,
        ...timeBlocksMap,
      };

      await scheduleRef.update({
        timeBlocks: mergedTimeBlocks,
      });

      return res.json({
        success: true,
        message: "Schedule updated successfully",
        schedule: {
          userId,
          timeBlocks: mergedTimeBlocks,
        },
      });
    } else {
      // Create new schedule
      await scheduleRef.set(scheduleData);

      return res.status(201).json({
        success: true,
        message: "Schedule created successfully",
        schedule: scheduleData,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create or update schedule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /schedules/:userId
 * Get a user's schedule
 */
router.get("/:userId", async (req, res) => {
  try {
    const {userId} = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const scheduleRef = db.collection("schedules").doc(userId);
    const scheduleDoc = await scheduleRef.get();

    if (!scheduleDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found for user",
      });
    }

    const scheduleData = scheduleDoc.data() as Schedule;

    // Convert time blocks map to array for response
    const timeBlocksArray = Object.values(scheduleData.timeBlocks);

    return res.json({
      success: true,
      message: "Schedule retrieved successfully",
      userId: scheduleData.userId,
      timeBlocks: timeBlocksArray,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve schedule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /schedules/:userId/timeblocks/:timeBlockId
 * Remove a specific time block from a user's schedule
 */
router.delete("/:userId/timeblocks/:timeBlockId",
  async (req, res) => {
    try {
      const {userId, timeBlockId} = req.params;

      if (!userId || !timeBlockId) {
        return res.status(400).json({
          success: false,
          message: "User ID and Time Block ID are required",
        });
      }

      const scheduleRef = db.collection("schedules").doc(userId);
      const scheduleDoc = await scheduleRef.get();

      if (!scheduleDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Schedule not found for user",
        });
      }

      const scheduleData = scheduleDoc.data() as Schedule;

      if (!scheduleData.timeBlocks[timeBlockId]) {
        return res.status(404).json({
          success: false,
          message: "Time block not found in user's schedule",
        });
      }

      // Remove the time block
      const updatedTimeBlocks = {...scheduleData.timeBlocks};
      delete updatedTimeBlocks[timeBlockId];

      await scheduleRef.update({
        timeBlocks: updatedTimeBlocks,
      });

      return res.json({
        success: true,
        message: "Time block removed successfully",
        removedTimeBlockId: timeBlockId,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to remove time block",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

export default router;
