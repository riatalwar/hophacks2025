import express from "express";
import {SyllabusProcessor} from "../services/syllabusProcessor";

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Process syllabus text and extract structured data
 */
router.post("/process-text", async (req, res) => {
  try {
    const {text} = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "No text provided",
        error: "Please provide 'text' in the request body",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key not configured",
        error: "GEMINI_API_KEY environment variable is missing",
      });
    }

    const processor = new SyllabusProcessor(apiKey);
    const result = await processor.processSyllabusText(text);

    return res.json({
      success: true,
      message: "Syllabus processed successfully",
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing syllabus text:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process syllabus text",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  return res.json({
    success: true,
    message: "Syllabus processor is running",
  });
});

export default router;
