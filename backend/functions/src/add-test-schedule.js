const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({
  projectId: 'hophacks2025'
});

const db = admin.firestore();

// Sample schedule data
const testSchedule = {
  userId: 'test-user-123',
  timeBlocks: {
    'wake-monday': {
      id: 'wake-monday',
      day: 0, // Monday
      startTime: 420, // 7:00 AM
      endTime: 430, // 7:10 AM
      type: 'wake',
      notes: 'Morning wake up'
    },
    'wake-tuesday': {
      id: 'wake-tuesday',
      day: 1, // Tuesday
      startTime: 420, // 7:00 AM
      endTime: 430, // 7:10 AM
      type: 'wake',
      notes: 'Morning wake up'
    },
    'wake-wednesday': {
      id: 'wake-wednesday',
      day: 2, // Wednesday
      startTime: 420, // 7:00 AM
      endTime: 430, // 7:10 AM
      type: 'wake',
      notes: 'Morning wake up'
    },
    'wake-thursday': {
      id: 'wake-thursday',
      day: 3, // Thursday
      startTime: 420, // 7:00 AM
      endTime: 430, // 7:10 AM
      type: 'wake',
      notes: 'Morning wake up'
    },
    'wake-friday': {
      id: 'wake-friday',
      day: 4, // Friday
      startTime: 420, // 7:00 AM
      endTime: 430, // 7:10 AM
      type: 'wake',
      notes: 'Morning wake up'
    },
    'bedtime-monday': {
      id: 'bedtime-monday',
      day: 0, // Monday
      startTime: 1380, // 11:00 PM
      endTime: 1390, // 11:10 PM
      type: 'bedtime',
      notes: 'Evening bedtime'
    },
    'bedtime-tuesday': {
      id: 'bedtime-tuesday',
      day: 1, // Tuesday
      startTime: 1380, // 11:00 PM
      endTime: 1390, // 11:10 PM
      type: 'bedtime',
      notes: 'Evening bedtime'
    },
    'bedtime-wednesday': {
      id: 'bedtime-wednesday',
      day: 2, // Wednesday
      startTime: 1380, // 11:00 PM
      endTime: 1390, // 11:10 PM
      type: 'bedtime',
      notes: 'Evening bedtime'
    },
    'bedtime-thursday': {
      id: 'bedtime-thursday',
      day: 3, // Thursday
      startTime: 1380, // 11:00 PM
      endTime: 1390, // 11:10 PM
      type: 'bedtime',
      notes: 'Evening bedtime'
    },
    'bedtime-friday': {
      id: 'bedtime-friday',
      day: 4, // Friday
      startTime: 1380, // 11:00 PM
      endTime: 1390, // 11:10 PM
      type: 'bedtime',
      notes: 'Evening bedtime'
    },
    'study-math-monday': {
      id: 'study-math-monday',
      day: 0, // Monday
      startTime: 540, // 9:00 AM
      endTime: 660, // 11:00 AM
      type: 'study',
      notes: 'Math Study Session'
    },
    'study-biology-tuesday': {
      id: 'study-biology-tuesday',
      day: 1, // Tuesday
      startTime: 600, // 10:00 AM
      endTime: 720, // 12:00 PM
      type: 'study',
      notes: 'Biology Study Session'
    },
    'study-chemistry-wednesday': {
      id: 'study-chemistry-wednesday',
      day: 2, // Wednesday
      startTime: 840, // 2:00 PM
      endTime: 960, // 4:00 PM
      type: 'study',
      notes: 'Chemistry Study Session'
    },
    'study-physics-thursday': {
      id: 'study-physics-thursday',
      day: 3, // Thursday
      startTime: 600, // 10:00 AM
      endTime: 720, // 12:00 PM
      type: 'study',
      notes: 'Physics Study Session'
    },
    'study-literature-friday': {
      id: 'study-literature-friday',
      day: 4, // Friday
      startTime: 840, // 2:00 PM
      endTime: 960, // 4:00 PM
      type: 'study',
      notes: 'Literature Study Session'
    },
    'study-weekend-saturday': {
      id: 'study-weekend-saturday',
      day: 5, // Saturday
      startTime: 600, // 10:00 AM
      endTime: 780, // 1:00 PM
      type: 'study',
      notes: 'Weekend Study Session'
    },
    'study-weekend-sunday': {
      id: 'study-weekend-sunday',
      day: 6, // Sunday
      startTime: 600, // 10:00 AM
      endTime: 780, // 1:00 PM
      type: 'study',
      notes: 'Weekend Study Session'
    }
  }
};

async function addTestSchedule() {
  try {
    console.log('Adding test schedule data to Firebase...');
    
    // Add the schedule document
    await db.collection('schedules').doc(testSchedule.userId).set(testSchedule);
    
    console.log('✅ Test schedule added successfully!');
    console.log(`📅 Schedule for user: ${testSchedule.userId}`);
    console.log(`⏰ Time blocks: ${Object.keys(testSchedule.timeBlocks).length}`);
    console.log(`🌅 Wake up times: ${Object.values(testSchedule.timeBlocks).filter(b => b.type === 'wake').length}`);
    console.log(`🌙 Bedtimes: ${Object.values(testSchedule.timeBlocks).filter(b => b.type === 'bedtime').length}`);
    console.log(`📚 Study sessions: ${Object.values(testSchedule.timeBlocks).filter(b => b.type === 'study').length}`);
    
    // Verify the data was added
    const doc = await db.collection('schedules').doc(testSchedule.userId).get();
    if (doc.exists) {
      console.log('✅ Verification successful - schedule document exists');
    } else {
      console.log('❌ Verification failed - schedule document not found');
    }
    
  } catch (error) {
    console.error('❌ Error adding test schedule:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addTestSchedule();
