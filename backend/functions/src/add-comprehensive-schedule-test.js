const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
admin.initializeApp({
  projectId: 'hophacks2025'
});

const db = admin.firestore();

// Helper function to create time blocks for a week
function createWeeklySchedule(userId, scheduleType = 'standard') {
  const timeBlocks = {};
  
  // Common wake up and bedtime times
  const wakeUpTime = 420; // 7:00 AM
  const bedtimeTime = 1380; // 11:00 PM
  
  // Add wake up times for Monday-Friday
  for (let day = 0; day < 5; day++) {
    timeBlocks[`wake-${day}`] = {
      id: `wake-${day}`,
      day: day,
      startTime: wakeUpTime,
      endTime: wakeUpTime + 10,
      type: 'wake',
      notes: 'Morning wake up'
    };
    
    timeBlocks[`bedtime-${day}`] = {
      id: `bedtime-${day}`,
      day: day,
      startTime: bedtimeTime,
      endTime: bedtimeTime + 10,
      type: 'bedtime',
      notes: 'Evening bedtime'
    };
  }
  
  // Add weekend wake up and bedtime (later times)
  for (let day = 5; day < 7; day++) {
    timeBlocks[`wake-${day}`] = {
      id: `wake-${day}`,
      day: day,
      startTime: 540, // 9:00 AM
      endTime: 550,
      type: 'wake',
      notes: 'Weekend wake up'
    };
    
    timeBlocks[`bedtime-${day}`] = {
      id: `bedtime-${day}`,
      day: day,
      startTime: 1440, // 12:00 AM (midnight)
      endTime: 1450,
      type: 'bedtime',
      notes: 'Weekend bedtime'
    };
  }
  
  // Add study sessions based on schedule type
  if (scheduleType === 'standard') {
    // Standard study schedule
    const studySessions = [
      { day: 0, start: 540, end: 660, subject: 'Math' }, // Monday 9-11 AM
      { day: 1, start: 600, end: 720, subject: 'Biology' }, // Tuesday 10-12 PM
      { day: 2, start: 840, end: 960, subject: 'Chemistry' }, // Wednesday 2-4 PM
      { day: 3, start: 600, end: 720, subject: 'Physics' }, // Thursday 10-12 PM
      { day: 4, start: 840, end: 960, subject: 'Literature' }, // Friday 2-4 PM
      { day: 5, start: 600, end: 780, subject: 'Weekend Study' }, // Saturday 10-1 PM
      { day: 6, start: 600, end: 780, subject: 'Weekend Study' } // Sunday 10-1 PM
    ];
    
    studySessions.forEach((session, index) => {
      timeBlocks[`study-${index}`] = {
        id: `study-${index}`,
        day: session.day,
        startTime: session.start,
        endTime: session.end,
        type: 'study',
        notes: `${session.subject} Study Session`
      };
    });
  } else if (scheduleType === 'intensive') {
    // Intensive study schedule (more sessions)
    const studySessions = [
      { day: 0, start: 480, end: 600, subject: 'Math' }, // Monday 8-10 AM
      { day: 0, start: 720, end: 840, subject: 'Physics' }, // Monday 12-2 PM
      { day: 1, start: 540, end: 660, subject: 'Biology' }, // Tuesday 9-11 AM
      { day: 1, start: 840, end: 960, subject: 'Chemistry' }, // Tuesday 2-4 PM
      { day: 2, start: 480, end: 600, subject: 'Literature' }, // Wednesday 8-10 AM
      { day: 2, start: 720, end: 840, subject: 'Math' }, // Wednesday 12-2 PM
      { day: 3, start: 540, end: 660, subject: 'Physics' }, // Thursday 9-11 AM
      { day: 3, start: 840, end: 960, subject: 'Biology' }, // Thursday 2-4 PM
      { day: 4, start: 480, end: 600, subject: 'Chemistry' }, // Friday 8-10 AM
      { day: 4, start: 720, end: 840, subject: 'Literature' }, // Friday 12-2 PM
      { day: 5, start: 600, end: 900, subject: 'Weekend Intensive' }, // Saturday 10-3 PM
      { day: 6, start: 600, end: 900, subject: 'Weekend Intensive' } // Sunday 10-3 PM
    ];
    
    studySessions.forEach((session, index) => {
      timeBlocks[`study-${index}`] = {
        id: `study-${index}`,
        day: session.day,
        startTime: session.start,
        endTime: session.end,
        type: 'study',
        notes: `${session.subject} Study Session`
      };
    });
  } else if (scheduleType === 'minimal') {
    // Minimal study schedule (fewer sessions)
    const studySessions = [
      { day: 1, start: 600, end: 720, subject: 'Core Study' }, // Tuesday 10-12 PM
      { day: 3, start: 840, end: 960, subject: 'Core Study' }, // Thursday 2-4 PM
      { day: 5, start: 600, end: 720, subject: 'Weekend Review' } // Saturday 10-12 PM
    ];
    
    studySessions.forEach((session, index) => {
      timeBlocks[`study-${index}`] = {
        id: `study-${index}`,
        day: session.day,
        startTime: session.start,
        endTime: session.end,
        type: 'study',
        notes: `${session.subject} Session`
      };
    });
  }
  
  return {
    userId: userId,
    timeBlocks: timeBlocks
  };
}

async function addTestSchedules() {
  try {
    console.log('🚀 Adding comprehensive test schedule data to Firebase...');
    
    // Create different schedule types for testing
    const testUsers = [
      { id: 'test-user-standard', type: 'standard' },
      { id: 'test-user-intensive', type: 'intensive' },
      { id: 'test-user-minimal', type: 'minimal' },
      { id: 'test-user-empty', type: 'empty' } // Empty schedule for testing empty state
    ];
    
    for (const user of testUsers) {
      if (user.type === 'empty') {
        // Add empty schedule
        await db.collection('schedules').doc(user.id).set({
          userId: user.id,
          timeBlocks: {}
        });
        console.log(`✅ Empty schedule added for user: ${user.id}`);
      } else {
        // Add schedule with time blocks
        const schedule = createWeeklySchedule(user.id, user.type);
        await db.collection('schedules').doc(user.id).set(schedule);
        
        const studyCount = Object.values(schedule.timeBlocks).filter(b => b.type === 'study').length;
        const wakeCount = Object.values(schedule.timeBlocks).filter(b => b.type === 'wake').length;
        const bedtimeCount = Object.values(schedule.timeBlocks).filter(b => b.type === 'bedtime').length;
        
        console.log(`✅ ${user.type} schedule added for user: ${user.id}`);
        console.log(`   📚 Study sessions: ${studyCount}`);
        console.log(`   🌅 Wake up times: ${wakeCount}`);
        console.log(`   🌙 Bedtimes: ${bedtimeCount}`);
      }
    }
    
    console.log('\n🎉 All test schedules added successfully!');
    console.log('\n📋 Test Users:');
    console.log('   • test-user-standard - Standard study schedule');
    console.log('   • test-user-intensive - Intensive study schedule');
    console.log('   • test-user-minimal - Minimal study schedule');
    console.log('   • test-user-empty - Empty schedule (for empty state testing)');
    
    console.log('\n🧪 To test the dashboard:');
    console.log('   1. Start the frontend: npm run dev');
    console.log('   2. Login with one of the test user IDs');
    console.log('   3. Check the dashboard weekly schedule section');
    
  } catch (error) {
    console.error('❌ Error adding test schedules:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addTestSchedules();
