import express from "express";
import cors from "cors";
import {db} from "./config/firebase";
import {GoogleGenerativeAI} from "@google/generative-ai";

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

app.get("/test-gemini", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key not configured",
        error: "GEMINI_API_KEY environment variable is missing",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({model: "gemini-pro"});

    const prompt = "Hello! Please respond with " +
      "'Gemini API is working correctly!'";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      message: "Gemini API connection successful",
      response: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gemini API connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default app;
