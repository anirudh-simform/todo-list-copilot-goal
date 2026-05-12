# Feature Specification: Scheduled Todos with Future-Date Planning

**Feature Branch**: `001-scheduled-todos`  
**Created**: 2026-05-12  
**Status**: Draft  
**Input**: User description: "I need to implement a feature that allows a user to add a todo for a future date, a user should only be able to mark that todo as complete at or after the day of the todo if the user is late to mark a todo complete by more than a day, mark it as overdue"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create a Todo for a Future Date (Priority: P1)

A user wants to plan ahead by creating todos that are scheduled for future dates. This is the foundational capability that enables all other features in this set.

**Why this priority**: Without the ability to create future-dated todos, the entire feature set has no value. This is the core functionality.

**Independent Test**: Can be fully tested by: creating a new todo, selecting a future date, saving it, and verifying it appears in the list with the scheduled date displayed. Delivers value of allowing users to plan ahead.

**Acceptance Scenarios**:

1. **Given** a user is on the todo creation screen, **When** they select a date in the future (e.g., tomorrow, next week), **Then** the todo is created with that scheduled date.
2. **Given** a user creates a todo for tomorrow, **When** they view the todo list, **Then** the todo displays the scheduled date clearly.
3. **Given** a user creates a todo for a future date, **When** they attempt to save without selecting a date, **Then** the system requires them to select a valid future date before saving.

---

### User Story 2 - Complete a Todo Only on or After Scheduled Date (Priority: P1)

Users should be prevented from marking todos complete before their scheduled date, ensuring realistic task planning.

**Why this priority**: This is critical for maintaining the integrity of the scheduled todo system—without this constraint, scheduled dates become meaningless. Equal priority to Story 1.

**Independent Test**: Can be fully tested by: creating a todo for tomorrow, attempting to mark it complete today, verifying completion is blocked, then advancing to tomorrow and confirming completion is allowed.

**Acceptance Scenarios**:

1. **Given** a todo is scheduled for tomorrow, **When** the user attempts to mark it complete today, **Then** completion is prevented and user sees a message explaining why.
2. **Given** a todo is scheduled for today, **When** the user marks it complete, **Then** completion is allowed immediately.
3. **Given** a todo is scheduled for tomorrow, **When** the system date becomes tomorrow, **Then** the user can successfully mark the todo complete.
4. **Given** a todo is already scheduled for today, **When** a user tries to mark it complete, **Then** it marks as complete without restriction.

---

### User Story 3 - Automatically Mark Todos as Overdue (Priority: P2)

Todos that are completed more than one day after their scheduled date should be automatically marked or indicated as overdue, helping users understand whether tasks were completed on time.

**Why this priority**: This adds valuable context to completed tasks but is not blocking—users can still complete and view todos without this feature. Secondary value.

**Independent Test**: Can be fully tested by: creating a todo for a specific date, completing it 2+ days later, and verifying it's marked as overdue.

**Acceptance Scenarios**:

1. **Given** a todo scheduled for Monday, **When** marked complete on Monday or Tuesday, **Then** it is NOT marked as overdue.
2. **Given** a todo scheduled for Monday, **When** marked complete on Wednesday or later, **Then** it is marked as overdue.
3. **Given** a completed overdue todo, **When** viewed in the list, **Then** it displays an overdue indicator (visual or textual) distinguishing it from on-time completions.

---

### User Story 4 - View Scheduled vs. Overdue Todos (Priority: P2)

Users should have visibility into which todos are upcoming (scheduled future todos) and which previously completed todos were overdue, supporting reflection on task management.

**Why this priority**: Enhances UX and provides actionable insights but is not blocking. Can be deferred if needed for MVP.

**Independent Test**: Can be fully tested by: viewing the todo list with a mix of scheduled, completed on-time, and completed overdue todos, and verifying each category is appropriately indicated.

**Acceptance Scenarios**:

1. **Given** a user has todos in various states, **When** they view the todo list, **Then** they can distinguish between pending, scheduled-for-future, completed-on-time, and completed-overdue todos.

---

### Edge Cases

- What happens when a user schedules a todo for a date far in the future (e.g., 1 year from now)?
- How does the system handle timezone differences if a user schedules a todo for "tomorrow" and then travels across timezones?
- What happens if a user backdates their system clock after a todo is scheduled?
- Can a user edit a scheduled todo's date after creation? If so, does the overdue status recalculate?
- How does the system handle edge cases around midnight (e.g., todo scheduled for "today" at 11:59 PM vs. scheduled for "tomorrow" at 12:01 AM)?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to create a new todo with an optional scheduled date set to any date in the future.
- **FR-002**: System MUST display the scheduled date when a todo is created for a future date.
- **FR-003**: System MUST prevent marking a todo complete if the current date is before the scheduled date, displaying a clear message to the user explaining why.
- **FR-004**: System MUST allow marking a todo complete only when the current date is on or after the scheduled date.
- **FR-005**: System MUST track whether a todo was completed on time (same day as scheduled or within 1 day after) or overdue (more than 1 day after scheduled date).
- **FR-006**: System MUST mark or flag todos as overdue when they are marked complete more than one day after their scheduled date.
- **FR-007**: System MUST persist all scheduled date and overdue status information in storage for later retrieval.
- **FR-008**: System MUST allow users to view todos with clear visual or textual indication of their state: pending (scheduled for future), on-time completion, or overdue completion.

### Key Entities

- **Todo**: Represents a task, now with optional scheduling capability. Key attributes: id, title, description, scheduled_date (optional), created_date, completed_date (optional), is_completed, is_overdue (computed/derived), status (pending/completed_on_time/completed_overdue).
- **ScheduledDate**: Represents the date a todo is planned to be completed. Must support date-only format (time is midnight of that day, or [NEEDS CLARIFICATION: should scheduled dates include specific times, or are they day-only?]).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can successfully create a todo with a future scheduled date within 2 clicks/taps from the creation screen.
- **SC-002**: System prevents completion of future-scheduled todos 100% of the time (no false positives allowing early completion).
- **SC-003**: Overdue status is correctly calculated and displayed for 100% of todos marked complete after their scheduled date + 1 day.
- **SC-004**: Users can visually distinguish pending, on-time completed, and overdue completed todos without ambiguity.
- **SC-005**: All scheduled todo data persists across browser sessions and app restarts (zero data loss).
- **SC-006**: Scheduled date picker loads within 300ms of user interaction.

## Performance & Efficiency Requirements _(per Constitution)_

### Performance Standards

- Scheduled date picker and state updates MUST complete within 16ms to maintain 60fps interactions.
- Todo list re-render on date change MUST be efficient (use memoization if list is large).
- Storage operations (save/retrieve scheduled dates) MUST complete within 200ms.
- No polling loops for date-based state changes; use event-driven or timed update mechanisms (e.g., daily recalculation or app startup check).

### Readability & Maintainability

- Scheduled date handling logic MUST be centralized in utility functions (avoid scattering date logic across components).
- Date formatting and comparison MUST use a consistent library or utility (e.g., ISO 8601 format for storage, localized display format for UI).
- Component props MUST clearly indicate whether a date is required, optional, or derived (e.g., `scheduledDate?: Date`, `isOverdue: boolean`).

### Efficiency Goals

- Date validation and comparison logic MUST use pure functions.
- No external date library dependencies unless justified (existing utility functions should be reviewed first).
- Overdue calculation MUST happen at load time or on daily tick, not on every render.

## Assumptions

- **Date handling**: Scheduled dates are day-only (no specific times). Completion is allowed anytime on or after the scheduled date. Overdue threshold is exactly 1 calendar day (24 hours) past midnight of the scheduled date.
- **User timezone**: The system uses the user's local device timezone for all date comparisons. No explicit timezone selection by user is required.
- **Existing infrastructure**: The current todo app already has storage (e.g., localStorage) and UI components for todos. This feature extends the existing data model and UI, not replacing them.
- **MVP scope**: Search/filter by scheduled date, recurring scheduled todos, and scheduled notifications are out of scope for v1.
- **No backend required**: All logic and storage is client-side (matching the current app architecture).
- **Backward compatibility**: Existing todos without a scheduled date continue to work unchanged (scheduled_date is optional).
