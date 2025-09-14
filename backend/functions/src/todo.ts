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
      category,
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

    const newTodoData = {
      title,
      notes: notes || "",
      dueDate: dueDate || "TBD",
      category: category || "General",
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
      category,
      priority,
      estimatedHours,
      completed,
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
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (estimatedHours !== undefined) {
      updateData.estimatedHours = estimatedHours;
    }
    if (completed !== undefined) updateData.completed = completed;

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
