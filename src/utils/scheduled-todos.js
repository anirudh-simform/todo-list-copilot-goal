/**
 * Scheduled Todos Utility Functions
 * 
 * Pure functions for date validation, formatting, and todo state management.
 * No side effects, fully testable, timezone-aware using device timezone.
 * 
 * All dates stored as ISO 8601 strings, compared at day-level (not millisecond).
 */

/**
 * Check if a todo is scheduled for a future date
 * @param {Object} todo - Todo object with optional scheduledDate field
 * @returns {boolean} true if scheduledDate exists and is in the future
 */
export function isScheduledForFuture(todo, today = new Date()) {
  if (!todo.scheduledDate) return false;
  
  const scheduled = new Date(todo.scheduledDate);
  const todayNorm = startOfDay(today);
  
  return scheduled > todayNorm;
}

/**
 * Check if a todo's scheduled date is today
 * @param {Object} todo - Todo object
 * @param {Date} today - Reference date (default: today)
 * @returns {boolean} true if scheduledDate equals today
 */
export function isTodoDueToday(todo, today = new Date()) {
  if (!todo.scheduledDate) return false;
  
  const scheduled = new Date(todo.scheduledDate);
  const todayNorm = startOfDay(today);
  
  return isSameDay(scheduled, todayNorm);
}

/**
 * Determine if a user can mark a todo as complete today
 * @param {Object} todo - Todo object
 * @param {Date} today - Reference date (default: today)
 * @returns {boolean} false if already completed or if scheduled for future; true otherwise
 */
export function canCompleteTodo(todo, today = new Date()) {
  // Can't complete if already completed
  if (todo.completed) return false;
  
  // If no scheduled date, can always complete
  if (!todo.scheduledDate) return true;
  
  // If scheduled date is in the future, cannot complete
  const scheduled = new Date(todo.scheduledDate);
  const todayNorm = startOfDay(today);
  
  return scheduled <= todayNorm;
}

/**
 * Determine if a completed todo was overdue (>1 day after scheduled date)
 * @param {string} scheduledDate - ISO 8601 scheduled date
 * @param {string} completedDate - ISO 8601 completion timestamp
 * @returns {boolean} true if completed >1 day after scheduled; false if on-time
 */
export function calculateOverdueStatus(scheduledDate, completedDate) {
  if (!scheduledDate) return false;
  
  const daysDiff = daysBetween(new Date(scheduledDate), new Date(completedDate));
  return daysDiff > 1;
}

/**
 * Get the current state of a todo (pending, scheduled, ready, completed, overdue)
 * @param {Object} todo - Todo object
 * @param {Date} today - Reference date (default: today)
 * @returns {string} one of: 'pending', 'scheduled', 'ready', 'completed_on_time', 'completed_overdue'
 */
export function getTodoStatus(todo, today = new Date()) {
  if (!todo.completed) {
    if (!todo.scheduledDate) return 'pending';
    
    const scheduled = new Date(todo.scheduledDate);
    const todayStart = startOfDay(today);
    
    if (scheduled > todayStart) return 'scheduled';
    return 'ready';
  }

  // completed === true
  if (!todo.scheduledDate) return 'completed_on_time'; // Unscheduled todos are "on-time"
  if (todo.isOverdue) return 'completed_overdue';
  return 'completed_on_time';
}

/**
 * Format a scheduled date for display to users
 * @param {string} dateString - ISO 8601 date string
 * @param {string} locale - BCP 47 language tag (default: 'en-US')
 * @returns {string} formatted date string (e.g., "May 15")
 */
export function formatScheduledDate(dateString, locale = 'en-US') {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
}

/**
 * Validate a scheduled date input
 * @param {string|undefined} dateString - ISO 8601 date string or undefined
 * @param {Date} today - Reference date for validation (default: today)
 * @returns {string|null} error message if invalid; null if valid
 */
export function validateScheduledDate(dateString, today = new Date()) {
  // Undefined is OK (optional field)
  if (dateString === undefined || dateString === null || dateString === '') return null;
  
  // Try to parse the date
  let date;
  try {
    date = new Date(dateString);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
  } catch {
    return 'Invalid date format';
  }
  
  // Check if date is today or in the future
  const todayNorm = startOfDay(today);
  const dateNorm = startOfDay(date);
  
  if (dateNorm < todayNorm) {
    return 'Scheduled date must be today or in the future';
  }
  
  return null; // Valid
}

/**
 * Normalize a date to midnight (start of day) in UTC
 * @param {Date} date - Input date
 * @returns {Date} Date normalized to midnight UTC
 * @private
 */
function startOfDay(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Check if two dates fall on the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} true if same day
 * @private
 */
function isSameDay(date1, date2) {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
         date1.getUTCMonth() === date2.getUTCMonth() &&
         date1.getUTCDate() === date2.getUTCDate();
}

/**
 * Calculate days between two dates (at day level, not millisecond)
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @returns {number} number of days between dates (can be negative)
 * @private
 */
function daysBetween(fromDate, toDate) {
  const from = startOfDay(fromDate);
  const to = startOfDay(toDate);
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}
