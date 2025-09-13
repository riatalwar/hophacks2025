import express from "express";
import multer from "multer";
import {SyllabusProcessor} from "../services/syllabusProcessor";

// eslint-disable-next-line new-cap
const router = express.Router();

const processor = new SyllabusProcessor(process.env.GEMINI_API_KEY || "");
const supportedMimeTypes = processor.getSupportedFileTypes();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (supportedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. " +
        `Supported types: ${supportedMimeTypes.join(", ")}`));
    }
  },
});

router.post("/process-syllabus", upload.single("syllabus"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided",
          error: "Please upload a file with the key 'syllabus'",
          supportedTypes: supportedMimeTypes,
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

      const syllabusProcessor = new SyllabusProcessor(apiKey);
      const result = await syllabusProcessor.processFullSyllabus(
        req.file.buffer,
        req.file.mimetype
      );

      return res.json({
        success: true,
        message: "Syllabus processed successfully",
        data: result,
        fileInfo: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error processing syllabus:", error);

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "File too large",
            error: "File must be smaller than 10MB",
          });
        }
      }

      return res.status(500).json({
        success: false,
        message: "Failed to process syllabus",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

router.get("/supported-file-types", (req, res) => {
  const syllabusProcessor = new SyllabusProcessor(
    process.env.GEMINI_API_KEY || "");

  return res.json({
    success: true,
    supportedTypes: syllabusProcessor.getSupportedFileTypes(),
    message: "List of supported file types for syllabus processing",
  });
});

export default router;

