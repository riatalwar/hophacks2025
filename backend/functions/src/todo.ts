import express from "express";
import {db} from "./config/firebase";

// eslint-disable-next-line new-cap
const router = express.Router();

// GET all todos for a user
router.get("/todos/:userId", async (req, res) => {
  try {
    const {userId} = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const todosCollection = db.collection("todos");
    const snapshot = await todosCollection
      .where("userId", "==", userId)
      .get();

    const todos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({success: true, todos});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve todos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST a new todo
router.post("/todos", async (req, res) => {
  try {
    const {
      title,
      notes,
      dueDate,
      activityId,
      priority,
      estimatedHours,
      userId,
    } = req.body;

    if (!title || !priority || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // If activityId is provided as activity name, check if it exists or create
    let finalActivityId = activityId;
    if (activityId && activityId.trim()) {
      const activitiesCollection = db.collection("activities");
      const activityQuery = await activitiesCollection
        .where("userId", "==", userId)
        .where("activityName", "==", activityId.trim())
        .get();

      if (activityQuery.empty) {
        // Create new activity if it doesn't exist
        const newActivityData = {
          activityName: activityId.trim(),
          color: "#4ecdc4", // Default color
          userId,
          createdAt: new Date().toISOString(),
        };
        const newActivityRef = await activitiesCollection.add(newActivityData);
        finalActivityId = newActivityRef.id;
      } else {
        // Use existing activity ID
        finalActivityId = activityQuery.docs[0].id;
      }
    }

    const newTodoData = {
      title,
      notes: notes || "",
      dueDate: dueDate || "TBD",
      activityId: finalActivityId || undefined,
      priority,
      estimatedHours: estimatedHours || undefined,
      userId,
      completed: false,
    };

    const docRef = await db.collection("todos").add(newTodoData);

    return res.status(201).json({
      success: true,
      message: "Todo added successfully",
      todo: {id: docRef.id, ...newTodoData},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PUT (update) a todo
router.put("/todos/:todoId", async (req, res) => {
  try {
    const {todoId} = req.params;
    const {
      title,
      notes,
      dueDate,
      activityId,
      priority,
      estimatedHours,
      completed,
      userId,
    } = req.body;

    if (!todoId) {
      return res.status(400).json({
        success: false,
        message: "Todo ID is required",
      });
    }

    const todoRef = db.collection("todos").doc(todoId);
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (notes !== undefined) updateData.notes = notes;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (priority !== undefined) updateData.priority = priority;
    if (estimatedHours !== undefined) {
      updateData.estimatedHours = estimatedHours;
    }
    if (completed !== undefined) updateData.completed = completed;

    // Handle activityId update
    if (activityId !== undefined) {
      if (activityId && activityId.trim() && userId) {
        const activitiesCollection = db.collection("activities");
        const activityQuery = await activitiesCollection
          .where("userId", "==", userId)
          .where("activityName", "==", activityId.trim())
          .get();

        if (activityQuery.empty) {
          // Create new activity if it doesn't exist
          const newActivityData = {
            activityName: activityId.trim(),
            color: "#4ecdc4", // Default color
            userId,
            createdAt: new Date().toISOString(),
          };
          const newActivityRef = await activitiesCollection
            .add(newActivityData);
          updateData.activityId = newActivityRef.id;
        } else {
          // Use existing activity ID
          updateData.activityId = activityQuery.docs[0].id;
        }
      } else {
        updateData.activityId = undefined;
      }
    }

    await todoRef.update(updateData);

    return res.json({
      success: true,
      message: "Todo updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// DELETE a todo
router.delete("/todos/:todoId", async (req, res) => {
  try {
    const {todoId} = req.params;
    if (!todoId) {
      return res.status(400).json({
        success: false,
        message: "Todo ID is required",
      });
    }

    await db.collection("todos").doc(todoId).delete();

    return res.json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete todo",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
