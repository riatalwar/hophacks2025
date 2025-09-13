// Placeholder function for parsing a todo list string into an array of items.
// This splits the input string by newlines to create substrings.
// Note: This is a simple placeholder implementation.
// In the future, this should be replaced with an LLM-based parser:
// pass the entire string to an LLM (e.g., via API call) and
// prompt it to extract todo items into a structured format
// (e.g., JSON array with status like [ ] or [x]).
// This placeholder demonstrates the basic output format for now.


/**
 * Adds two numbers together.
 * @param {string} todoString A long string, like from the notes app,
 *                            containing all relevant TODOs
 * @return {string[]} The list of tasks parsed from the todo list
 */
export function parseTodoList(todoString: string): string[] {
  return todoString
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0); // Remove empty lines
}

// Example usage:
// const todoStr = "Item 1\nItem 2\n\nItem 3";
// const items = parseTodoList(todoStr);  // ["Item 1", "Item 2", "Item 3"]
