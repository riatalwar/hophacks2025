#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🧪 Manual Schedule Test Script');
console.log('===============================\n');

console.log('This script will add test schedule data to your running Firebase emulator.\n');

console.log('Prerequisites:');
console.log('✅ Firebase emulator should be running (firebase emulators:start --only firestore)');
console.log('✅ Make sure you\'re in the backend/functions directory\n');

console.log('Adding test schedule data...\n');

// Run the comprehensive test script
exec('node src/add-comprehensive-schedule-test.js', { cwd: path.join(__dirname) }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running test script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️  Warning:', stderr);
  }
  
  console.log(stdout);
  
  console.log('\n🎯 Test Data Added Successfully!');
  console.log('\n📋 Available Test Users:');
  console.log('   • test-user-standard - Standard study schedule (7 study sessions)');
  console.log('   • test-user-intensive - Intensive study schedule (12 study sessions)');
  console.log('   • test-user-minimal - Minimal study schedule (3 study sessions)');
  console.log('   • test-user-empty - Empty schedule (for testing empty state)');
  
  console.log('\n🧪 How to Test:');
  console.log('   1. Start your frontend: cd ../../frontend && npm run dev');
  console.log('   2. Open the app in your browser');
  console.log('   3. Login with one of the test user IDs above');
  console.log('   4. Navigate to the Dashboard page');
  console.log('   5. Check the "Weekly Schedule" section');
  console.log('   6. You should see time blocks displayed on the calendar');
  
  console.log('\n🔍 What to Look For:');
  console.log('   • Wake up times (orange blocks) at 7:00 AM weekdays, 9:00 AM weekends');
  console.log('   • Bedtimes (purple blocks) at 11:00 PM weekdays, 12:00 AM weekends');
  console.log('   • Study sessions (teal blocks) at various times');
  console.log('   • Time formatting in 12-hour AM/PM format');
  console.log('   • Proper positioning on the calendar grid');
  console.log('   • Empty state message for test-user-empty');
  
  console.log('\n🔄 To Test Different Schedules:');
  console.log('   • Log out and log back in with different test user IDs');
  console.log('   • Each user has a different schedule pattern');
  console.log('   • Compare the intensive vs minimal schedules');
  
  console.log('\n✨ Happy Testing!');
});
