import express from "express";
import cors from "cors";
import {db} from "./config/firebase";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({status: "OK", message: "Backend server is running!"});
});

app.get("/test-firestore", async (req, res) => {
  try {
    const testCollection = db.collection("test");
    const snapshot = await testCollection.get();
    res.json({
      success: true,
      message: "Firestore connection successful",
      documentsCount: snapshot.size,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Firestore connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.post('/activities', async (req, res) => {
  try {
    const activity = req.body;
    const docRef = await db.collection('activities').add(activity);
    res.status(201).json({ id: docRef.id, ...activity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

export default app;
