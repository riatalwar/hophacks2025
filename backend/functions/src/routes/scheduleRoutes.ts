import { Router } from "express";
import { db } from "../config/firebase";
import { TodoItem } from "@shared/types/tasks";
import { TimeBlock } from "@shared/types/scheduling";
import { generateSchedule } from "@shared/utils/schedulingUtils";

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
/**
 * GET /api/schedule/:userId
 * Returns the most recent generated schedule for the given user, or 404 if none found.
 */
router.get("/api/schedule/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Query for the most recent generated schedule for the user
    const snapshot = await db
      .collection("generatedSchedules")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No generated schedule found for this user." });
    }

    const scheduleDoc = snapshot.docs[0];
    const data = scheduleDoc.data();

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return res.status(500).json({
      message: "Failed to fetch schedule",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /calendar/:userId
 * Serves the user's most recent generated schedule as a .ics calendar file.
 */
router.get("/calendar/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Query for the most recent generated schedule for the user
    const snapshot = await db
      .collection("generatedSchedules")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No generated schedule found for this user." });
    }

    const scheduleDoc = snapshot.docs[0];
    const data = scheduleDoc.data();
    const schedule = data.generatedSchedule;
    const sessions = schedule.sessions || [];

    // Construct ICS content
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HopHacks//Schedule//EN"
    ];

    sessions.forEach((session: any, idx: number) => {
      // Required fields: uid, summary, description, dtstart, dtend
      // Example mapping (customize if your session shape demands):
      // session = { id, name, description, start, end }
      const uid = session.id || `session-${idx}-${userId}`;
      const summary = session.name || "";
      const description = session.description || "";
      // Datetime conversion for ICS (expects: YYYYMMDDTHHmmssZ)
      // Assume session.start and session.end are ISO strings
      const dtstart = session.start ? new Date(session.start).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z").replace("T", "T") : "";
      const dtend = session.end ? new Date(session.end).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z").replace("T", "T") : "";

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");
    const icsString = icsContent.join("\r\n");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="schedule.ics"');
    return res.send(icsString);
  } catch (error) {
    console.error("Error generating calendar ICS:", error);
    return res.status(500).json({
      message: "Failed to generate calendar ICS file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
export default router;