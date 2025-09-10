import { format } from 'prettier';
import * as plugin from '../src/index.js';

/**
 * Helper function to format Hugo content with the prettier plugin
 */
export async function formatCode(input, options = {}) {
  return await format(input, {
    parser: 'hugo-post',
    plugins: [plugin],
    ...options,
  });
}

/**
 * Table-driven test helper for formatting tests
 * @param {Array} testCases - Array of test case objects
 * @param {string} testCases[].name - Test case name
 * @param {string} testCases[].input - Input Hugo content
 * @param {Object} testCases[].options - Prettier options (optional)
 * @param {Array<string>} testCases[].shouldContain - Array of strings that should be in output
 * @param {Array<string>} testCases[].shouldNotContain - Array of strings that should NOT be in output (optional)
 */
export function runTableDrivenTests(testCases) {
  testCases.forEach(({ name, input, options = {}, shouldContain = [], shouldNotContain = [] }) => {
    test(name, async () => {
      const result = await formatCode(input, options);

      // Check all required content
      shouldContain.forEach(expected => {
        expect(result).toContain(expected);
      });

      // Check excluded content
      shouldNotContain.forEach(notExpected => {
        expect(result).not.toContain(notExpected);
      });
    });
  });
}

/**
 * Table-driven test helper for performance tests
 * @param {Array} testCases - Array of performance test cases
 * @param {string} testCases[].name - Test case name
 * @param {Function} testCases[].generateInput - Function that returns input content
 * @param {number} testCases[].maxTime - Maximum time in milliseconds
 * @param {Array<string>} testCases[].shouldContain - Array of strings that should be in output
 */
export function runPerformanceTests(testCases) {
  testCases.forEach(({ name, generateInput, maxTime, shouldContain = [] }) => {
    test(name, async () => {
      const input = generateInput();

      const start = performance.now();
      const result = await formatCode(input);
      const end = performance.now();

      expect(end - start).toBeLessThan(maxTime);

      shouldContain.forEach(expected => {
        expect(result).toContain(expected);
      });
    });
  });
}

/**
 * Table-driven test helper for error recovery tests
 * @param {Array} testCases - Array of error recovery test cases
 * @param {string} testCases[].name - Test case name
 * @param {string} testCases[].input - Malformed input content
 * @param {Array<string>} testCases[].shouldContain - Array of strings that should be in output
 * @param {number} testCases[].maxTime - Maximum processing time (optional)
 */
export function runErrorRecoveryTests(testCases) {
  testCases.forEach(({ name, input, shouldContain = [], maxTime = 1000 }) => {
    test(name, async () => {
      const start = performance.now();

      let result;
      expect(() => {
        result = formatCode(input);
      }).not.toThrow();

      result = await result;
      const end = performance.now();

      if (maxTime) {
        expect(end - start).toBeLessThan(maxTime);
      }

      shouldContain.forEach(expected => {
        expect(result).toContain(expected);
      });
    });
  });
}
