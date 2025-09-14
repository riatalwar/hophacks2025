# .ics File Import Documentation

## Overview

The .ics file import functionality allows users to upload calendar files (.ics format) and automatically populate their busy times in the study preferences calendar. This feature includes comprehensive time rounding, edge case handling, and extensive validation.

## Features

### ✅ **Core Functionality**
- **File Upload**: Drag-and-drop or click to select .ics files
- **Time Rounding**: Automatic 30-minute increment rounding
  - Start times: Round down (1:15 PM → 1:00 PM)
  - End times: Round up (2:45 PM → 3:00 PM)
- **Calendar Population**: Events are converted to busy times in the WeekCalendar
- **Real-time Validation**: Immediate feedback on file validity and parsing errors

### ✅ **Time Rounding Logic**
```typescript
// Start times: Round down to nearest 30-minute increment
1:15 PM → 1:00 PM
1:30 PM → 1:30 PM
1:45 PM → 1:30 PM
2:00 PM → 2:00 PM

// End times: Round up to nearest 30-minute increment
1:15 PM → 1:30 PM
1:30 PM → 1:30 PM
1:45 PM → 2:00 PM
2:00 PM → 2:00 PM
```

### ✅ **Edge Case Handling**
- **All-day Events**: Skipped with warning (no specific time)
- **Recurring Events**: First occurrence imported only (with warning)
- **Past Events**: Skipped if older than 1 year (with warning)
- **Duration Events**: Converted to start/end times
- **Invalid Events**: Skipped with error logging
- **Timezone Support**: Basic timezone detection and handling

### ✅ **Validation & Error Handling**
- **File Format Validation**: Ensures valid .ics structure
- **Content Validation**: Checks for required fields
- **Time Validation**: Ensures start < end times
- **Error Reporting**: Detailed error messages for users
- **Warning System**: Non-critical issues reported as warnings

## File Structure

### `frontend/src/utils/icsParser.ts`
Main parser utility with comprehensive .ics file handling:

```typescript
// Core interfaces
interface ParsedEvent {
  id: string;
  summary: string;
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  isAllDay: boolean;
  isRecurring: boolean;
  originalStart: string;
  originalEnd: string;
}

interface ParsedCalendar {
  events: ParsedEvent[];
  timezone: string;
  errors: string[];
  warnings: string[];
}

// Main functions
parseICSFile(content: string): ParsedCalendar
roundTimeTo30MinIncrement(timeInMinutes: number, isEndTime: boolean): number
validateICSContent(content: string): { isValid: boolean; errors: string[] }
convertEventsToBusyTimes(events: ParsedEvent[]): Array<{...}>
```

### `frontend/src/pages/Preferences.tsx`
Integration with the preferences page:

```typescript
// Updated import handler
const handleImportIcs = async () => {
  // 1. Read file content
  // 2. Validate .ics content
  // 3. Parse events with time rounding
  // 4. Convert to busy times format
  // 5. Update WeekCalendar state
  // 6. Show success/error messages
};
```

### `frontend/test-ics-import.html`
Comprehensive test page for manual testing:

- **File Upload Testing**: Test with your own .ics files
- **Sample Data Testing**: Pre-built test cases for edge cases
- **Time Rounding Visualization**: See how times are rounded
- **Error Handling Testing**: Test various error conditions

## Supported .ics Formats

### ✅ **Time Formats**
- `DTSTART:20241216T090000` (YYYYMMDDTHHMMSS)
- `DTSTART:20241216T091500` (with minutes)
- `DTEND:20241216T100000` (end times)
- `DURATION:PT1H30M` (duration instead of end time)

### ✅ **Date Formats**
- `DTSTART;VALUE=DATE:20241216` (all-day events)
- `DTSTART:20241216T090000` (date + time)

### ✅ **Event Properties**
- `SUMMARY`: Event title
- `UID`: Unique identifier
- `DTSTART`: Start date/time
- `DTEND`: End date/time
- `DURATION`: Event duration
- `RRULE`: Recurrence rules

## Testing

### **Automated Testing**
Run the test suite:
```typescript
import { runICSParserTests } from './utils/icsParser.test';
runICSParserTests();
```

### **Manual Testing**
1. Open `frontend/test-ics-import.html` in your browser
2. Test with sample data or upload your own .ics files
3. Verify time rounding behavior
4. Check error handling with invalid files

### **Test Cases Covered**
- ✅ Basic single event parsing
- ✅ Multiple events on different days
- ✅ Time rounding (start down, end up)
- ✅ All-day events (skipped with warning)
- ✅ Recurring events (first occurrence only)
- ✅ Duration events (converted to start/end)
- ✅ Past events (skipped if > 1 year old)
- ✅ Invalid calendars (error handling)
- ✅ Empty calendars (no events)
- ✅ Malformed content (error handling)

## Usage Examples

### **Basic .ics File**
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:test-event-1@example.com
DTSTART:20241216T091500
DTEND:20241216T104500
SUMMARY:Team Meeting
END:VEVENT
END:VCALENDAR
```

**Result**: 
- Event: "Team Meeting"
- Day: Monday (0)
- Original: 9:15 AM - 10:45 AM
- Rounded: 9:00 AM - 11:00 AM (start down, end up)

### **Multiple Events**
```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
UID:event-1@example.com
DTSTART:20241216T090000
DTEND:20241216T100000
SUMMARY:Monday Class
END:VEVENT
BEGIN:VEVENT
UID:event-2@example.com
DTSTART:20241217T140000
DTEND:20241217T150000
SUMMARY:Tuesday Lab
END:VEVENT
END:VCALENDAR
```

**Result**: Two busy time blocks added to Monday and Tuesday

### **Duration Event**
```ics
BEGIN:VEVENT
UID:duration-1@example.com
DTSTART:20241216T090000
DURATION:PT1H30M
SUMMARY:Workshop
END:VEVENT
```

**Result**: 9:00 AM - 10:30 AM busy time block

## Error Handling

### **Validation Errors**
- Missing VCALENDAR header/footer
- No events found
- Invalid file format

### **Parse Errors**
- Malformed date/time strings
- Missing required fields
- Invalid time ranges

### **Warnings**
- All-day events skipped
- Recurring events (first occurrence only)
- Past events skipped
- Time too short after rounding

## Performance Considerations

- **File Size**: Handles files up to several MB efficiently
- **Memory Usage**: Streams parsing to avoid memory issues
- **Error Recovery**: Continues parsing after encountering errors
- **Time Complexity**: O(n) where n is number of lines in file

## Future Enhancements

### **Planned Features**
- [ ] Recurring event expansion (full series)
- [ ] Timezone conversion
- [ ] Event conflict detection
- [ ] Bulk import from multiple files
- [ ] Export functionality

### **Advanced Time Rounding**
- [ ] Custom rounding intervals (15min, 1hour)
- [ ] Business hours consideration
- [ ] Weekend handling

## Troubleshooting

### **Common Issues**

1. **"No events found"**
   - Check if file contains valid VEVENT blocks
   - Ensure events have DTSTART and DTEND/DURATION

2. **"Invalid time range"**
   - Verify start time is before end time
   - Check for timezone issues

3. **"Events too short after rounding"**
   - Original event duration < 30 minutes
   - Consider manual time block creation

4. **"Parse errors"**
   - File may be corrupted or malformed
   - Try re-exporting from calendar application

### **Debug Mode**
Enable console logging to see detailed parsing information:
```typescript
console.log('Parsed events:', parsedCalendar.events);
console.log('Warnings:', parsedCalendar.warnings);
console.log('Errors:', parsedCalendar.errors);
```

## Integration Notes

The .ics import functionality integrates seamlessly with the existing busy times system:

1. **State Management**: Uses existing `busyTimes` state
2. **UI Integration**: Works with existing WeekCalendar component
3. **Persistence**: Saves to localStorage like other preferences
4. **Validation**: Respects existing time validation rules

This implementation provides a robust, user-friendly way to import calendar events and automatically populate busy times for optimal study scheduling.

## Calendar Integration Fix

### Problem Identified
The calendar integration had a critical issue where imported ICS events weren't appearing in the WeekCalendar component:
- ✅ ICS parsing worked correctly
- ✅ Time blocks were created from parsed events  
- ✅ Parent component's busyTimes state was updated
- ❌ **WeekCalendar component never received the imported events**
- ❌ WeekCalendar's internal timeBlocks state was never updated
- ❌ localStorage was never updated with imported events

### Solution Implemented

#### 1. Added externalTimeBlocks prop to WeekCalendar
```typescript
interface WeekCalendarProps {
  externalTimeBlocks?: TimeBlock[]; // New prop to receive external time blocks
}
```

#### 2. Added useEffect to handle external time blocks
```typescript
useEffect(() => {
  if (externalTimeBlocks && externalTimeBlocks.length > 0) {
    setTimeBlocks(prevBlocks => {
      const filteredBlocks = prevBlocks.filter(block => !block.id.startsWith('imported-'));
      const mergedBlocks = [...filteredBlocks, ...externalTimeBlocks];
      saveTimeBlocks(mergedBlocks);
      return mergedBlocks;
    });
  }
}, [externalTimeBlocks]);
```

#### 3. Updated Preferences.tsx to pass imported events
```typescript
const [importedTimeBlocks, setImportedTimeBlocks] = useState<TimeBlock[]>([]);

// In handleImportIcs function:
setImportedTimeBlocks(timeBlocks);

// Pass to WeekCalendar component:
<WeekCalendar externalTimeBlocks={importedTimeBlocks} />
```

#### 4. Added TimeBlock interface to ClassTypes.ts
```typescript
export interface TimeBlock {
  id: string;
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'study' | 'wake' | 'bedtime';
  summary?: string; // Optional summary for imported events
}
```

### Result
Now when you import an ICS file:
1. ✅ Events are parsed from ICS file
2. ✅ Time blocks are created with proper formatting
3. ✅ **WeekCalendar receives externalTimeBlocks prop**
4. ✅ **WeekCalendar updates its internal timeBlocks state**
5. ✅ **Events appear visually on the calendar**
6. ✅ **Events are saved to localStorage**
7. ✅ **Events persist across page refreshes**
