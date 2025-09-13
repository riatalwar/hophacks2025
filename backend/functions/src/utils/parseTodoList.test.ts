// Tests for parseTodoList function.
// Note: These tests are for the simple placeholder implementation (string splitting by newlines).
// They do NOT test the future LLM-based version, which would involve API calls to parse the todo string
// into a structured format (e.g., JSON array with status like [ ] or [x]). Once the LLM integration is
// implemented, these tests should be updated or supplemented to validate the parsed structure and statuses.
// For now, they verify basic splitting, trimming, and filtering behavior.

import { parseTodoList } from './parseTodoList';

describe('parseTodoList (Placeholder Implementation)', () => {
  test('splits a simple todo string by newlines', () => {
    const input = 'Item 1\nItem 2\nItem 3';
    const expected = ['Item 1', 'Item 2', 'Item 3'];
    expect(parseTodoList(input)).toEqual(expected);
  });

  test('trims whitespace from each line', () => {
    const input = '  Item 1 \n\tItem 2  \nItem 3   ';
    const expected = ['Item 1', 'Item 2', 'Item 3'];
    expect(parseTodoList(input)).toEqual(expected);
  });

  test('filters out empty lines', () => {
    const input = 'Item 1\n\nItem 2\n  \nItem 3';
    const expected = ['Item 1', 'Item 2', 'Item 3'];
    expect(parseTodoList(input)).toEqual(expected);
  });

  test('handles input with only empty lines', () => {
    const input = '\n\n  \n\t ';
    expect(parseTodoList(input)).toEqual([]);
  });

  test('handles single line input', () => {
    const input = 'Single Item';
    expect(parseTodoList(input)).toEqual(['Single Item']);
  });

  test('handles empty string', () => {
    const input = '';
    expect(parseTodoList(input)).toEqual([]);
  });

  // Future LLM tests would go here, e.g.:
  // test('parses with LLM (future)', () => {
  //   // Mock LLM call and expect structured output like [{text: 'Item 1', status: 'pending'}]
  // });
});