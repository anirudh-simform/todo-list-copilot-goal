/**
 * Time utility functions for deadline management
 * All times are in 24-hour format internally (HH:MM)
 */

/**
 * Convert 24-hour format to 12-hour or keep as 24-hour
 * @param {string} time24 - Time in "HH:MM" format (24-hour)
 * @param {string} format - "12" or "24"
 * @returns {string} Formatted time string
 */
export function formatTime(time24, format = '12') {
  if (!time24 || typeof time24 !== 'string') return ''
  
  const [hours, minutes] = time24.split(':').map(Number)
  
  if (isNaN(hours) || isNaN(minutes)) return ''
  
  if (format === '24') {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }
  
  // 12-hour format
  const isPM = hours >= 12
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const period = isPM ? 'PM' : 'AM'
  
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

/**
 * Parse 12-hour time string to 24-hour format
 * @param {string} time12 - Time in "H:MM AM/PM" or "HH:MM AM/PM" format
 * @returns {string} Time in "HH:MM" format (24-hour)
 */
export function parse12To24(time12) {
  if (!time12 || typeof time12 !== 'string') return ''
  
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return ''
  
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const period = match[3].toUpperCase()
  
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Check if a time is in the past (compared to current time today)
 * @param {string} time24 - Time in "HH:MM" format (24-hour)
 * @returns {boolean} True if time is in the past
 */
export function isTimeInPast(time24) {
  if (!time24) return false
  
  const [hours, minutes] = time24.split(':').map(Number)
  const now = new Date()
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()
  
  if (hours < currentHours) return true
  if (hours === currentHours && minutes < currentMinutes) return true
  
  return false
}

/**
 * Get deadline status
 * @param {string} time24 - Time in "HH:MM" format (24-hour)
 * @returns {string} One of: "overdue", "soon", "upcoming"
 */
export function getDeadlineStatus(time24) {
  if (!time24) return 'upcoming'
  
  if (isTimeInPast(time24)) {
    return 'overdue'
  }
  
  const [hours, minutes] = time24.split(':').map(Number)
  const now = new Date()
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()
  
  // Calculate minutes until deadline
  const deadlineInMinutes = hours * 60 + minutes
  const currentInMinutes = currentHours * 60 + currentMinutes
  const minutesUntil = deadlineInMinutes - currentInMinutes
  
  // Within 30 minutes
  if (minutesUntil <= 30 && minutesUntil > 0) {
    return 'soon'
  }
  
  return 'upcoming'
}

/**
 * Validate time format
 * @param {string} time - Time string in "HH:MM" format
 * @returns {boolean} True if valid
 */
export function isValidTime(time) {
  if (!time || typeof time !== 'string') return false
  
  const match = time.match(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  return !!match
}

/**
 * Get current time in 24-hour format
 * @returns {string} Current time in "HH:MM" format
 */
export function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}
