const admin = require('firebase-admin');

// Initialize Firebase Admin (using default credentials for emulator)
admin.initializeApp({
  projectId: 'hophacks2025'
});

const db = admin.firestore();

async function addTestActivities() {
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
    console.log(`Added ${testActivities.length} activities for user: test-user-1`);
    
    // Also add some activities for a different user
    const testUser2Activities = [
      {
        userId: "test-user-2",
        activityName: "Computer Science Project",
        color: "#54a0ff",
        websiteLink: "https://github.com",
        canvasContent: "Build a web application",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: "test-user-2",
        activityName: "Database Design",
        color: "#a55eea",
        websiteLink: "https://sqlite.org",
        canvasContent: "Design database schema",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const batch2 = db.batch();
    for (const activity of testUser2Activities) {
      const docRef = db.collection("activities").doc();
      batch2.set(docRef, activity);
    }
    
    await batch2.commit();
    console.log(`✅ Added ${testUser2Activities.length} activities for user: test-user-2`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding test activities:", error);
    process.exit(1);
  }
}

addTestActivities();
