#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Firebase Emulator and adding test schedule data...\n');

// Start Firebase emulator
const emulator = spawn('firebase', ['emulators:start', '--only', 'firestore'], {
  cwd: path.join(__dirname),
  stdio: 'pipe'
});

emulator.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // Check if emulator is ready
  if (output.includes('All emulators ready!')) {
    console.log('\n⏳ Waiting 3 seconds for emulator to fully initialize...');
    
    setTimeout(() => {
      console.log('\n📊 Adding test schedule data...');
      
      // Run the test data script
      const testScript = spawn('node', ['src/add-comprehensive-schedule-test.js'], {
        cwd: path.join(__dirname),
        stdio: 'inherit'
      });
      
      testScript.on('close', (code) => {
        console.log('\n✅ Test data addition completed!');
        console.log('\n🎯 Next steps:');
        console.log('   1. Keep this emulator running');
        console.log('   2. Start your frontend: cd ../../frontend && npm run dev');
        console.log('   3. Login with one of these test user IDs:');
        console.log('      - test-user-standard');
        console.log('      - test-user-intensive');
        console.log('      - test-user-minimal');
        console.log('      - test-user-empty');
        console.log('   4. Check the dashboard weekly schedule section');
        console.log('\n🛑 Press Ctrl+C to stop the emulator when done testing');
      });
    }, 3000);
  }
});

emulator.stderr.on('data', (data) => {
  console.error('Emulator error:', data.toString());
});

emulator.on('close', (code) => {
  console.log(`\n🛑 Firebase emulator stopped with code ${code}`);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down emulator...');
  emulator.kill('SIGINT');
  process.exit(0);
});
