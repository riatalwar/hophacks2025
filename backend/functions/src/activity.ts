import express from "express";
import cors from "cors";
import {db} from "./config/firebase";

const activity = express();

activity.use(cors());
activity.use(express.json());

// Function to add test activities to Firebase
const addTestActivities = async () => {
    try {
        console.log("Adding test activities to Firebase...");
        
        const testActivities = [
            {
                userId: "test-user-1",
                activityName: "Math Homework",
                color: "#4ecdc4",
                websiteLink: "https://khanacademy.org",
                canvasContent: "Complete exercises 1-10",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: "test-user-1", 
                activityName: "Physics Lab Report",
                color: "#ff6b6b",
                websiteLink: "https://physicsclassroom.com",
                canvasContent: "Write lab report for experiment 3",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: "test-user-1",
                activityName: "History Reading",
                color: "#45b7d1",
                websiteLink: "https://history.com",
                canvasContent: "Read chapters 5-7",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: "test-user-1",
                activityName: "Chemistry Study Group",
                color: "#96ceb4",
                websiteLink: "",
                canvasContent: "Review for midterm exam",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: "test-user-1",
                activityName: "English Essay",
                color: "#feca57",
                websiteLink: "https://grammarly.com",
                canvasContent: "Write 5-page essay on Shakespeare",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const batch = db.batch();
        
        for (const activity of testActivities) {
            const docRef = db.collection("activities").doc();
            batch.set(docRef, activity);
        }
        
        await batch.commit();
        console.log("✅ Test activities added successfully!");
        return { success: true, count: testActivities.length };
        
    } catch (error) {
        console.error("❌ Error adding test activities:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
};

// Endpoint to add test activities
activity.post("/test-data", async (req, res) => {
    try {
        const result = await addTestActivities();
        
        if (result.success) {
            return res.json({
                success: true,
                message: `Successfully added ${result.count} test activities`,
                count: result.count
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to add test activities",
                error: result.error
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add test activities",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

activity.get("/activities/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const activitiesCollection = db.collection("activities");
        const snapshot = await activitiesCollection.where("userId", "==", userId).get();

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

export default activity;