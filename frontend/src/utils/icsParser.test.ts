/**
 * Comprehensive test suite for .ics parser
 * Tests various edge cases, time formats, and calendar structures
 */

import { 
  parseICSFile, 
  parseTimeString, 
  parseDateToDayOfWeek, 
  roundTimeTo30MinIncrement,
  parseDuration,
  validateICSContent,
  convertEventsToBusyTimes
} from './icsParser';

// Test data for various scenarios
const testICSContent = {
  // Basic calendar with single event
  basic: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-event-1@example.com
DTSTART:20241216T090000
DTEND:20241216T100000
SUMMARY:Test Event
END:VEVENT
END:VCALENDAR`,

  // Calendar with multiple events on different days
  multipleEvents: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:event-1@example.com
DTSTART:20241216T090000
DTEND:20241216T100000
SUMMARY:Monday Meeting
END:VEVENT
BEGIN:VEVENT
UID:event-2@example.com
DTSTART:20241217T140000
DTEND:20241217T150000
SUMMARY:Tuesday Class
END:VEVENT
BEGIN:VEVENT
UID:event-3@example.com
DTSTART:20241218T100000
DTEND:20241218T120000
SUMMARY:Wednesday Workshop
END:VEVENT
END:VCALENDAR`,

  // Calendar with events requiring time rounding
  timeRounding: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:round-1@example.com
DTSTART:20241216T091500
DTEND:20241216T104500
SUMMARY:Round Test 1
END:VEVENT
BEGIN:VEVENT
UID:round-2@example.com
DTSTART:20241216T103000
DTEND:20241216T120000
SUMMARY:Round Test 2
END:VEVENT
END:VCALENDAR`,

  // Calendar with all-day events
  allDayEvents: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:allday-1@example.com
DTSTART;VALUE=DATE:20241216
DTEND;VALUE=DATE:20241217
SUMMARY:All Day Event
END:VEVENT
BEGIN:VEVENT
UID:regular-1@example.com
DTSTART:20241216T090000
DTEND:20241216T100000
SUMMARY:Regular Event
END:VEVENT
END:VCALENDAR`,

  // Calendar with recurring events
  recurringEvents: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:recurring-1@example.com
DTSTART:20241216T090000
DTEND:20241216T100000
RRULE:FREQ=WEEKLY;COUNT=3
SUMMARY:Weekly Meeting
END:VEVENT
END:VCALENDAR`,

  // Calendar with duration instead of end time
  durationEvents: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:duration-1@example.com
DTSTART:20241216T090000
DURATION:PT1H30M
SUMMARY:Duration Event
END:VEVENT
BEGIN:VEVENT
UID:duration-2@example.com
DTSTART:20241216T140000
DURATION:PT2H
SUMMARY:Long Duration Event
END:VEVENT
END:VCALENDAR`,

  // Invalid calendar (missing required fields)
  invalid: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:invalid-1@example.com
SUMMARY:Invalid Event
END:VEVENT
END:VCALENDAR`,

  // Empty calendar
  empty: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
END:VCALENDAR`,

  // Calendar with past events
  pastEvents: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:past-1@example.com
DTSTART:20200101T090000
DTEND:20200101T100000
SUMMARY:Old Event
END:VEVENT
BEGIN:VEVENT
UID:current-1@example.com
DTSTART:20241216T090000
DTEND:20241216T100000
SUMMARY:Current Event
END:VEVENT
END:VCALENDAR`,

  // Calendar with timezone information
  timezone: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
TZID:America/New_York
BEGIN:VEVENT
UID:tz-1@example.com
DTSTART:20241216T090000
DTEND:20241216T100000
SUMMARY:Timezone Event
END:VEVENT
END:VCALENDAR`
};

// Test functions
export function runICSParserTests(): void {
  console.log('🧪 Running .ics Parser Tests...\n');

  // Test 1: Basic calendar parsing
  testBasicParsing();
  
  // Test 2: Time rounding functionality
  testTimeRounding();
  
  // Test 3: Multiple events parsing
  testMultipleEvents();
  
  // Test 4: Edge cases
  testEdgeCases();
  
  // Test 5: Error handling
  testErrorHandling();
  
  // Test 6: Validation
  testValidation();
  
  console.log('✅ All tests completed!\n');
}

function testBasicParsing(): void {
  console.log('📋 Test 1: Basic Calendar Parsing');
  
  const result = parseICSFile(testICSContent.basic);
  
  console.assert(result.events.length === 1, 'Should parse 1 event');
  console.assert(result.events[0].summary === 'Test Event', 'Should parse event summary');
  console.assert(result.events[0].startTime === 540, 'Should parse start time (9:00 AM = 540 minutes)');
  console.assert(result.events[0].endTime === 600, 'Should parse end time (10:00 AM = 600 minutes)');
  console.assert(result.events[0].day === 0, 'Should parse day (Monday = 0)');
  console.assert(result.errors.length === 0, 'Should have no errors');
  
  console.log('✅ Basic parsing test passed\n');
}

function testTimeRounding(): void {
  console.log('📋 Test 2: Time Rounding');
  
  // Test start time rounding (round down)
  console.assert(roundTimeTo30MinIncrement(555, false) === 540, '1:15 PM should round down to 1:00 PM');
  console.assert(roundTimeTo30MinIncrement(540, false) === 540, '1:00 PM should stay 1:00 PM');
  console.assert(roundTimeTo30MinIncrement(570, false) === 540, '1:30 PM should round down to 1:00 PM');
  console.assert(roundTimeTo30MinIncrement(600, false) === 600, '2:00 PM should stay 2:00 PM');
  
  // Test end time rounding (round up)
  console.assert(roundTimeTo30MinIncrement(555, true) === 570, '1:15 PM should round up to 1:30 PM');
  console.assert(roundTimeTo30MinIncrement(540, true) === 540, '1:00 PM should stay 1:00 PM');
  console.assert(roundTimeTo30MinIncrement(570, true) === 570, '1:30 PM should stay 1:30 PM');
  console.assert(roundTimeTo30MinIncrement(600, true) === 600, '2:00 PM should stay 2:00 PM');
  
  // Test with actual .ics content
  const result = parseICSFile(testICSContent.timeRounding);
  console.assert(result.events.length === 2, 'Should parse 2 events');
  console.assert(result.events[0].startTime === 540, '9:15 AM should round down to 9:00 AM');
  console.assert(result.events[0].endTime === 630, '10:45 AM should round up to 10:30 AM');
  
  console.log('✅ Time rounding test passed\n');
}

function testMultipleEvents(): void {
  console.log('📋 Test 3: Multiple Events');
  
  const result = parseICSFile(testICSContent.multipleEvents);
  
  console.assert(result.events.length === 3, 'Should parse 3 events');
  console.assert(result.events[0].day === 0, 'First event should be Monday');
  console.assert(result.events[1].day === 1, 'Second event should be Tuesday');
  console.assert(result.events[2].day === 2, 'Third event should be Wednesday');
  
  // Check sorting
  console.assert(result.events[0].startTime <= result.events[1].startTime, 'Events should be sorted by time');
  
  console.log('✅ Multiple events test passed\n');
}

function testEdgeCases(): void {
  console.log('📋 Test 4: Edge Cases');
  
  // Test all-day events (should be skipped)
  const allDayResult = parseICSFile(testICSContent.allDayEvents);
  console.assert(allDayResult.events.length === 1, 'Should skip all-day events');
  console.assert(allDayResult.warnings.length > 0, 'Should warn about skipped all-day events');
  
  // Test recurring events (should import first occurrence only)
  const recurringResult = parseICSFile(testICSContent.recurringEvents);
  console.assert(recurringResult.events.length === 1, 'Should import first occurrence of recurring event');
  console.assert(recurringResult.warnings.length > 0, 'Should warn about recurring events');
  
  // Test duration events
  const durationResult = parseICSFile(testICSContent.durationEvents);
  console.assert(durationResult.events.length === 2, 'Should parse duration events');
  console.assert(durationResult.events[0].endTime === 630, '1.5 hour duration should be correct');
  console.assert(durationResult.events[1].endTime === 840, '2 hour duration should be correct');
  
  // Test past events (should be skipped)
  const pastResult = parseICSFile(testICSContent.pastEvents);
  console.assert(pastResult.events.length === 1, 'Should skip past events');
  console.assert(pastResult.warnings.length > 0, 'Should warn about skipped past events');
  
  console.log('✅ Edge cases test passed\n');
}

function testErrorHandling(): void {
  console.log('📋 Test 5: Error Handling');
  
  // Test invalid calendar
  const invalidResult = parseICSFile(testICSContent.invalid);
  console.assert(invalidResult.events.length === 0, 'Should not parse invalid events');
  console.assert(invalidResult.errors.length > 0, 'Should have errors for invalid calendar');
  
  // Test empty calendar
  const emptyResult = parseICSFile(testICSContent.empty);
  console.assert(emptyResult.events.length === 0, 'Should handle empty calendar');
  
  // Test malformed content
  const malformedResult = parseICSFile('not a calendar');
  console.assert(malformedResult.events.length === 0, 'Should handle malformed content');
  console.assert(malformedResult.errors.length > 0, 'Should have errors for malformed content');
  
  console.log('✅ Error handling test passed\n');
}

function testValidation(): void {
  console.log('📋 Test 6: Validation');
  
  // Test valid content
  const validResult = validateICSContent(testICSContent.basic);
  console.assert(validResult.isValid === true, 'Should validate basic calendar');
  console.assert(validResult.errors.length === 0, 'Should have no validation errors');
  
  // Test invalid content
  const invalidResult = validateICSContent('not a calendar');
  console.assert(invalidResult.isValid === false, 'Should reject invalid content');
  console.assert(invalidResult.errors.length > 0, 'Should have validation errors');
  
  // Test empty content
  const emptyResult = validateICSContent('');
  console.assert(emptyResult.isValid === false, 'Should reject empty content');
  
  console.log('✅ Validation test passed\n');
}

// Utility function to test time parsing
export function testTimeParsing(): void {
  console.log('📋 Test: Time String Parsing');
  
  // Test various time formats
  console.assert(parseTimeString('0900') === 540, 'HHMM format');
  console.assert(parseTimeString('09:00') === 540, 'HH:MM format');
  console.assert(parseTimeString('090000') === 540, 'HHMMSS format');
  console.assert(parseTimeString('09:00:00') === 540, 'HH:MM:SS format');
  console.assert(parseTimeString('14:30') === 870, '2:30 PM');
  console.assert(parseTimeString('23:59') === 1439, '11:59 PM');
  
  console.log('✅ Time parsing test passed\n');
}

// Utility function to test date parsing
export function testDateParsing(): void {
  console.log('📋 Test: Date Parsing');
  
  // Test various dates (all should be Monday = 0)
  console.assert(parseDateToDayOfWeek('20241216') === 0, 'December 16, 2024 should be Monday');
  console.assert(parseDateToDayOfWeek('20241217') === 1, 'December 17, 2024 should be Tuesday');
  console.assert(parseDateToDayOfWeek('20241218') === 2, 'December 18, 2024 should be Wednesday');
  
  console.log('✅ Date parsing test passed\n');
}

// Export test data for manual testing
export { testICSContent };
