/**
 * Test Suite: Scheduled Todos Utility Functions
 * 
 * Tests for US1: Create a Todo for a Future Date
 * Tests for US2: Complete a Todo Only on/After Scheduled Date
 * Tests for US3: Automatically Mark Todos as Overdue
 * Tests for US4: Visual Distinctions
 */

import {
  isScheduledForFuture,
  canCompleteTodo,
  calculateOverdueStatus,
  getTodoStatus,
  formatScheduledDate,
  validateScheduledDate,
  isTodoDueToday,
} from './scheduled-todos';

// ============================================================================
// USER STORY 1: Create a Todo for a Future Date
// ============================================================================

describe('US1: Create a Todo for a Future Date', () => {
  const today = new Date('2026-05-12'); // Current test date

  describe('formatScheduledDate()', () => {
    test('formats date as "Mon DD" (e.g., "May 15")', () => {
      const result = formatScheduledDate('2026-05-15T00:00:00Z', 'en-US');
      expect(result).toBe('May 15');
    });

    test('handles different locales (e.g., de-DE)', () => {
      const result = formatScheduledDate('2026-05-15T00:00:00Z', 'de-DE');
      expect(result).toContain('Mai'); // German for May
    });

    test('returns empty string for invalid date', () => {
      const result = formatScheduledDate('invalid-date');
      expect(result).toBe('');
    });

    test('returns empty string for undefined', () => {
      const result = formatScheduledDate(undefined);
      expect(result).toBe('');
    });
  });

  describe('validateScheduledDate()', () => {
    test('accepts today\'s date', () => {
      const result = validateScheduledDate('2026-05-12T00:00:00Z', today);
      expect(result).toBeNull();
    });

    test('accepts future dates', () => {
      const result = validateScheduledDate('2026-05-20T00:00:00Z', today);
      expect(result).toBeNull();
    });

    test('rejects past dates', () => {
      const result = validateScheduledDate('2026-05-10T00:00:00Z', today);
      expect(result).toMatch(/today or in the future/i);
    });

    test('rejects invalid date format', () => {
      const result = validateScheduledDate('not-a-date', today);
      expect(result).toMatch(/invalid/i);
    });

    test('allows undefined/null (optional field)', () => {
      expect(validateScheduledDate(undefined, today)).toBeNull();
      expect(validateScheduledDate(null, today)).toBeNull();
      expect(validateScheduledDate('', today)).toBeNull();
    });
  });

  describe('isScheduledForFuture()', () => {
    test('returns true for todos scheduled in the future', () => {
      const todo = { scheduledDate: '2026-05-20T00:00:00Z' };
      expect(isScheduledForFuture(todo, today)).toBe(true);
    });

    test('returns false for todos scheduled today', () => {
      const todo = { scheduledDate: '2026-05-12T00:00:00Z' };
      expect(isScheduledForFuture(todo, today)).toBe(false);
    });

    test('returns false for todos scheduled in the past', () => {
      const todo = { scheduledDate: '2026-05-10T00:00:00Z' };
      expect(isScheduledForFuture(todo, today)).toBe(false);
    });

    test('returns false for unscheduled todos', () => {
      const todo = {};
      expect(isScheduledForFuture(todo, today)).toBe(false);
    });
  });

  describe('getTodoStatus() - US1 Scenarios', () => {
    test('returns "pending" for unscheduled, incomplete todos', () => {
      const todo = { text: 'Buy milk', completed: false };
      expect(getTodoStatus(todo, today)).toBe('pending');
    });

    test('returns "scheduled" for incomplete todos scheduled in the future', () => {
      const todo = { text: 'Buy milk on 20th', completed: false, scheduledDate: '2026-05-20T00:00:00Z' };
      expect(getTodoStatus(todo, today)).toBe('scheduled');
    });

    test('returns "ready" for incomplete todos scheduled today or past', () => {
      const todo = { text: 'Buy milk today', completed: false, scheduledDate: '2026-05-12T00:00:00Z' };
      expect(getTodoStatus(todo, today)).toBe('ready');
    });
  });
});

// ============================================================================
// USER STORY 2: Complete a Todo Only on/After Scheduled Date
// ============================================================================

describe('US2: Complete a Todo Only on/After Scheduled Date', () => {
  const today = new Date('2026-05-12');

  describe('canCompleteTodo()', () => {
    test('returns false for already completed todos', () => {
      const todo = { completed: true };
      expect(canCompleteTodo(todo, today)).toBe(false);
    });

    test('returns true for unscheduled incomplete todos', () => {
      const todo = { completed: false };
      expect(canCompleteTodo(todo, today)).toBe(true);
    });

    test('returns false for incomplete todos scheduled in the future', () => {
      const todo = { completed: false, scheduledDate: '2026-05-20T00:00:00Z' };
      expect(canCompleteTodo(todo, today)).toBe(false);
    });

    test('returns true for incomplete todos scheduled today', () => {
      const todo = { completed: false, scheduledDate: '2026-05-12T00:00:00Z' };
      expect(canCompleteTodo(todo, today)).toBe(true);
    });

    test('returns true for incomplete todos scheduled in the past', () => {
      const todo = { completed: false, scheduledDate: '2026-05-10T00:00:00Z' };
      expect(canCompleteTodo(todo, today)).toBe(true);
    });
  });

  describe('isTodoDueToday()', () => {
    test('returns true for todos scheduled for today', () => {
      const todo = { scheduledDate: '2026-05-12T00:00:00Z' };
      expect(isTodoDueToday(todo, today)).toBe(true);
    });

    test('returns false for todos scheduled in the future', () => {
      const todo = { scheduledDate: '2026-05-20T00:00:00Z' };
      expect(isTodoDueToday(todo, today)).toBe(false);
    });

    test('returns false for unscheduled todos', () => {
      const todo = {};
      expect(isTodoDueToday(todo, today)).toBe(false);
    });
  });
});

// ============================================================================
// USER STORY 3: Automatically Mark Todos as Overdue
// ============================================================================

describe('US3: Automatically Mark Todos as Overdue', () => {
  describe('calculateOverdueStatus()', () => {
    test('returns false for todos completed on the scheduled date', () => {
      const scheduled = '2026-05-12T00:00:00Z';
      const completed = '2026-05-12T15:30:00Z';
      expect(calculateOverdueStatus(scheduled, completed)).toBe(false);
    });

    test('returns false for todos completed 1 day after scheduled date', () => {
      const scheduled = '2026-05-12T00:00:00Z';
      const completed = '2026-05-13T15:30:00Z';
      expect(calculateOverdueStatus(scheduled, completed)).toBe(false);
    });

    test('returns true for todos completed >1 day after scheduled date', () => {
      const scheduled = '2026-05-12T00:00:00Z';
      const completed = '2026-05-14T00:00:00Z';
      expect(calculateOverdueStatus(scheduled, completed)).toBe(true);
    });

    test('returns false for unscheduled todos (no scheduledDate)', () => {
      const completed = '2026-05-14T00:00:00Z';
      expect(calculateOverdueStatus(null, completed)).toBe(false);
    });

    test('returns true for todos completed far in the future', () => {
      const scheduled = '2026-05-12T00:00:00Z';
      const completed = '2026-06-01T00:00:00Z';
      expect(calculateOverdueStatus(scheduled, completed)).toBe(true);
    });
  });

  describe('getTodoStatus() - US3 Scenarios', () => {
    const today = new Date('2026-05-12');

    test('returns "completed_on_time" for completed todos without scheduledDate', () => {
      const todo = { completed: true };
      expect(getTodoStatus(todo, today)).toBe('completed_on_time');
    });

    test('returns "completed_on_time" for completed todos with isOverdue false', () => {
      const todo = {
        completed: true,
        scheduledDate: '2026-05-12T00:00:00Z',
        isOverdue: false,
      };
      expect(getTodoStatus(todo, today)).toBe('completed_on_time');
    });

    test('returns "completed_overdue" for completed todos with isOverdue true', () => {
      const todo = {
        completed: true,
        scheduledDate: '2026-05-12T00:00:00Z',
        isOverdue: true,
      };
      expect(getTodoStatus(todo, today)).toBe('completed_overdue');
    });
  });
});

// ============================================================================
// USER STORY 4: Visual Distinctions
// ============================================================================

describe('US4: Visual Distinctions', () => {
  const today = new Date('2026-05-12');

  describe('getTodoStatus() - All States', () => {
    test('pending: unscheduled, incomplete', () => {
      const todo = { completed: false };
      expect(getTodoStatus(todo, today)).toBe('pending');
    });

    test('scheduled: future scheduled, incomplete', () => {
      const todo = { completed: false, scheduledDate: '2026-05-20T00:00:00Z' };
      expect(getTodoStatus(todo, today)).toBe('scheduled');
    });

    test('ready: today/past scheduled, incomplete', () => {
      const todo = { completed: false, scheduledDate: '2026-05-12T00:00:00Z' };
      expect(getTodoStatus(todo, today)).toBe('ready');
    });

    test('completed_on_time: completed, on-time or unscheduled', () => {
      const todo1 = { completed: true };
      const todo2 = { completed: true, scheduledDate: '2026-05-12T00:00:00Z', isOverdue: false };
      expect(getTodoStatus(todo1, today)).toBe('completed_on_time');
      expect(getTodoStatus(todo2, today)).toBe('completed_on_time');
    });

    test('completed_overdue: completed, >1 day late', () => {
      const todo = {
        completed: true,
        scheduledDate: '2026-05-12T00:00:00Z',
        isOverdue: true,
      };
      expect(getTodoStatus(todo, today)).toBe('completed_overdue');
    });
  });
});

// ============================================================================
// EDGE CASES & ROBUSTNESS
// ============================================================================

describe('Edge Cases & Robustness', () => {
  const today = new Date('2026-05-12');

  describe('Midnight and Timezone Handling', () => {
    test('treats different times on same day as same day', () => {
      const todo = { completed: false, scheduledDate: '2026-05-12T00:00:00Z' };
      const earlyToday = new Date('2026-05-12T06:00:00Z');
      const lateToday = new Date('2026-05-12T23:59:59Z');

      expect(canCompleteTodo(todo, earlyToday)).toBe(true);
      expect(canCompleteTodo(todo, lateToday)).toBe(true);
    });

    test('midnight is considered part of the scheduled day', () => {
      const scheduled = '2026-05-12T00:00:00Z';
      const completed = '2026-05-12T00:00:01Z';
      expect(calculateOverdueStatus(scheduled, completed)).toBe(false);
    });
  });

  describe('Leap Year & DST Handling', () => {
    test('handles leap year date (Feb 29)', () => {
      const leapDate = '2024-02-29T00:00:00Z';
      const result = formatScheduledDate(leapDate, 'en-US');
      expect(result).toContain('29');
    });

    test('handles year boundary', () => {
      const todo = { completed: false, scheduledDate: '2027-01-01T00:00:00Z' };
      const yearEnd = new Date('2026-12-31');
      expect(canCompleteTodo(todo, yearEnd)).toBe(false);
    });
  });

  describe('Far Future Dates', () => {
    test('handles dates many years in the future', () => {
      const farFuture = { completed: false, scheduledDate: '2050-12-31T00:00:00Z' };
      const today = new Date('2026-05-12');
      expect(isScheduledForFuture(farFuture, today)).toBe(true);
    });
  });

  describe('Null/Undefined Safety', () => {
    test('handles missing todo object gracefully', () => {
      expect(() => {
        canCompleteTodo({}, new Date());
      }).not.toThrow();
    });

    test('handles null/undefined dates', () => {
      expect(formatScheduledDate(null)).toBe('');
      expect(formatScheduledDate(undefined)).toBe('');
    });
  });
});

// Test helper
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${expected} but got ${value}`);
      }
    },
    toMatch(pattern) {
      if (!pattern.test(value)) {
        throw new Error(`Expected "${value}" to match ${pattern}`);
      }
    },
    toBeNull() {
      if (value !== null) {
        throw new Error(`Expected null but got ${value}`);
      }
    },
    toContain(substring) {
      if (!value.includes(substring)) {
        throw new Error(`Expected "${value}" to contain "${substring}"`);
      }
    },
    toThrow() {
      let threw = false;
      try {
        value();
      } catch {
        threw = true;
      }
      if (!threw) {
        throw new Error(`Expected function to throw`);
      }
    },
    not: {
      toThrow() {
        try {
          value();
        } catch (error) {
          throw new Error(`Expected function not to throw, but it threw: ${error.message}`);
        }
      },
    },
  };
}

function describe(suite, fn) {
  console.log(`\n${suite}`);
  fn();
}
