# Implementation Plan: Scheduled Todos with Future-Date Planning

**Branch**: `001-scheduled-todos` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-scheduled-todos/spec.md`

## Summary

Add future-date scheduling capability to todos with completion constraints: prevent marking todos complete before their scheduled date, and flag todos as overdue if completed >1 day after scheduling. Uses SolidJS reactive signals for date tracking and localStorage for persistence. No new dependencies required.

## Technical Context

**Language/Version**: JavaScript (ES2020+) via SolidJS 1.6.12  
**Primary Dependencies**: solid-js (^1.6.12), Vite (^4.4.9), vite-plugin-solid (^2.5.3)  
**Storage**: Browser localStorage (client-side only)  
**Testing**: Vite test runner (to be selected during implementation)  
**Target Platform**: Web browsers (desktop/mobile)
**Project Type**: Frontend web application (single-page app)  
**Performance Goals**: 60 fps interactions, <16ms render time per component interaction, no bundle size increase  
**Constraints**: <200ms visual feedback on user interactions, localStorage <5MB, offline-capable (all state client-side)  
**Scale/Scope**: Single user, hundreds of todos, real-time UI updates

## Constitution Check _(SolidJS Constitution v1.0.0)_

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Implementation Gates

- [x] **Performance Excellence**: Feature complexity justified—scheduling logic uses pure date comparisons (O(1)), no new dependencies, granular reactivity via signals. Render time impact minimal (single additional signal per todo).
- [x] **Readable Abstractions**: Component names will follow functional intent (`<ScheduledTodoBadge />`, `<DatePicker />`). Props explicitly typed and destructured. Date logic extracted to pure utility functions (`isScheduledForFuture()`, `calculateOverdueStatus()`).
- [x] **Program Efficiency**: Zero new dependencies—all date logic via native Date objects. Local state (scheduled date per todo) co-located in todo data model. localStorage already in use, no new storage systems. CSS for visual indicators is minimal.
- [x] **Observable Behavior**: Completion prevention shows explicit message to user (error boundary in UI). No async operations (all date operations synchronous). localStorage failures already handled by existing app.

### Post-Design Gates (Phase 1)

- [x] Component structure follows functional intent naming
- [x] No CSS-in-JS dependencies added
- [x] Bundle size impact quantified and accepted
- [x] Storage/timeout strategies documented for async operations

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── App.jsx                          # Main app component (existing)
├── components/
│   ├── TodoItem.jsx                 # Extended with scheduled date display
│   ├── ScheduledTodoBadge.jsx       # NEW: Visual badge for scheduled status
│   ├── DatePicker.jsx               # Existing or NEW: Date input for scheduling
│   ├── SettingsPanel.jsx            # Existing
│   └── TimePicker.jsx               # Existing
├── utils/
│   ├── time.js                      # Existing
│   └── scheduled-todos.js           # NEW: Pure functions for date logic
├── index.css                        # Updated with styles for scheduled state
└── main.jsx                         # Entry point (existing)
```

**Structure Decision**: Single project, minimal expansion. New utilities (`scheduled-todos.js`) co-located with existing time utilities. New components (`ScheduledTodoBadge`, potentially `DatePicker` if not reused) in `components/`. Existing components minimally extended (TodoItem gets new props). No new folders needed.

## Complexity Tracking

_No Constitution violations. Feature is minimal in scope and complexity._

---

## Phase 0: Research (Resolve Clarifications)

### Research Tasks

1. **Date Formatting Standards in SolidJS**: Research best practices for date handling in reactive frameworks—use native Date, date library, or ISO strings?
2. **localStorage Quota Management**: Review how existing app handles localStorage quota exceeded; ensure scheduled dates don't exceed 5MB limit.
3. **Browser Date API Consistency**: Verify Date object behavior across target browsers (timezone handling, leap seconds, edge cases).

### Findings

**Decision: Native Date Objects + ISO 8601 String Storage**

- Use `new Date()` for date comparisons (JS engine optimized, no external dependency).
- Store as ISO 8601 strings in JSON (human-readable, easy to debug in DevTools).
- Parse on load: `new Date(isoString)` for comparison logic.
- Rationale: Zero external dependencies, native performance, localStorage savings vs. date libraries.

**Decision: Day-Only Scheduling**

- Per spec assumption, scheduled dates are day-only (no time component).
- Normalize to midnight UTC for storage: `new Date(year, month, day, 0, 0, 0, 0).toISOString()`.
- Comparison uses `getFullYear() + getMonth() + getDate()` to handle user timezone correctly.
- Rationale: Aligns with user intent (schedule for "tomorrow", not "tomorrow at 3pm"), simpler logic, no timezone confusion.

**Decision: Overdue Calculation at Completion Time**

- Calculate overdue status when marking complete, not on every render.
- Store as boolean flag (`isOverdue: true/false`) in todo object.
- Rationale: Minimal re-rendering, clear audit trail (todo knows how it was completed), fast lookup.

---

## Phase 1: Design & Contracts

### Data Model (data-model.md)

Extended Todo entity:

```javascript
{
  id: string,                   // Existing: unique identifier
  title: string,                // Existing
  description: string,          // Existing
  completed: boolean,           // Existing
  createdAt: string,            // Existing: ISO 8601
  scheduledDate?: string,       // NEW: ISO 8601 (day-only), optional
  completedAt?: string,         // Existing or NEW: ISO 8601, when marked complete
  isOverdue?: boolean           // NEW: true if completed > 1 day after scheduledDate
}
```

State transitions:

- **Pending** (no scheduledDate): Can mark complete immediately.
- **Scheduled** (scheduledDate in future): Cannot mark complete; show blockade message.
- **Ready to Complete** (scheduledDate = today): Can mark complete.
- **Completed On-Time**: (scheduledDate set, completedAt = scheduledDate or within 1 day) → isOverdue = false.
- **Completed Overdue**: (scheduledDate set, completedAt > scheduledDate + 1 day) → isOverdue = true.

### Utility Functions (scheduled-todos.js)

Pure functions exported:

```javascript
isScheduledForFuture(todo: Todo) -> boolean
isTodoDueToday(todo: Todo) -> boolean
canCompleteTodo(todo: Todo, today?: Date) -> boolean
calculateOverdueStatus(scheduledDate: string, completedDate: string) -> boolean
getTodoStatus(todo: Todo) -> 'pending' | 'scheduled' | 'ready' | 'completed_on_time' | 'completed_overdue'
formatScheduledDate(dateString: string, locale: string = 'en-US') -> string
```

### Components

**ScheduledTodoBadge.jsx**

- Props: `todo: Todo`, `today?: Date` (for testing)
- Renders: Date badge if scheduled, "Overdue" label if isOverdue, empty if no schedule
- CSS classes: `.todo-scheduled`, `.todo-overdue`, `.todo-on-time`

**TodoItem.jsx (Extended)**

- New props: `canComplete: boolean`, `blockMessage?: string`
- Logic: Disable complete button if `!canComplete`, show blockMessage on hover
- Conditional rendering: Show ScheduledTodoBadge for each todo

**DatePicker.jsx (if new)**

- Props: `value?: Date`, `onChange: (date: Date) => void`, `minDate?: Date`
- Allows selection of future dates only (disable past dates in calendar)
- Returns ISO date string

### Storage Contract

localStorage key: `todos` (existing)

```json
{
  "todos": [
    {
      "id": "...",
      "title": "...",
      "scheduledDate": "2026-05-15T00:00:00.000Z",
      "completedAt": "2026-05-16T14:32:00.000Z",
      "isOverdue": false
    }
  ]
}
```

### Quickstart (quickstart.md)

1. Install dependencies: `npm install` (no changes)
2. Create a todo with scheduled date:
   - Open app, click "Add Todo"
   - Enter title, select future date from picker
   - Save
3. View todo: Displays date badge (e.g., "May 15")
4. Attempt to complete early: Button disabled, tooltip explains "Available after May 15"
5. On scheduled date: Button enabled, mark complete, no overdue flag
6. Mark complete 2+ days late: Button enabled, marked overdue, displays "Overdue" label

### Post-Design Constitution Check

- [x] Component structure: `ScheduledTodoBadge` (functional intent clear), `TodoItem` extended minimally
- [x] No CSS-in-JS: Using plain CSS classes (`.todo-scheduled`, `.todo-overdue`)
- [x] Bundle size impact: Zero new dependencies, ~1KB utility code, ~500B CSS
- [x] Storage/timeout strategies: Synchronous date operations (no timeouts needed), localStorage already in app

---

## Ready for Phase 2: Task Generation

All research complete. Data model and component contracts defined. No NEEDS CLARIFICATION markers remain. Ready for `/speckit.tasks` command to generate implementation tasks.md.
