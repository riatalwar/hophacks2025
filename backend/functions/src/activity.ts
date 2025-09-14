import express from "express";
import {db} from "./config/firebase";
import {SyllabusProcessor} from "./services/syllabusProcessor";
import {TodoItem} from "@shared/types/tasks";

// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/:userId", async (req, res) => {
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

router.post("/", async (req, res) => {
  try {
    const {
      activityName,
      color,
      websiteLink,
      canvasContent,
      userId,
    } = req.body;

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
      activity: {id: docRef.id, ...newActivityData},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add activity",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.delete("/:activityId", async (req, res) => {
  try {
    const {
      activityId,
    } = req.params;

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

router.post("/process-syllabus", async (req, res) => {
  try {
    const {
      text,
      activityId,
      userId,
    } = req.body;

    if (!text || !activityId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Text, activity ID, and user ID are required",
      });
    }

    // Initialize the syllabus processor
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return res.status(500).json({
        success: false,
        message: "AI processing service not configured",
      });
    }

    const processor = new SyllabusProcessor(apiKey);

    // Process the syllabus text with Gemini
    const processedSyllabus = await processor.processSyllabusText(text);

    // Store tasks in database using the existing todos collection structure
    let tasksCreated = 0;
    if (processedSyllabus.tasks && processedSyllabus.tasks.length > 0) {
      const todosCollection = db.collection("todos");

      for (const task of processedSyllabus.tasks) {
        const todoData: TodoItem = {
          id: "", // Will be set by Firestore when document is created
          title: task.title,
          notes: task.notes,
          dueDate: task.dueDate !== "TBD" ? task.dueDate : "TBD",
          priority: task.priority,
          estimatedHours: task.estimatedHours,
          completed: false,
          activityId,
          userId,
        };

        const docRef = await todosCollection.add(todoData);

        // Update the document with its ID to match TodoItem interface
        await docRef.update({id: docRef.id});

        tasksCreated++;
      }
    }

    return res.json({
      success: true,
      message: "Syllabus processed successfully",
      tasksCreated,
      courseName: processedSyllabus.courseName,
      courseCode: processedSyllabus.courseCode,
    });
  } catch (error) {
    console.error("Syllabus processing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process syllabus",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
