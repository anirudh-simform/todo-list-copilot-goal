# Tasks: Scheduled Todos with Future-Date Planning

**Input**: Design documents from `/specs/001-scheduled-todos/`
**Branch**: `001-scheduled-todos`  
**Status**: Ready for implementation

## Overview

Implementation of scheduled todos feature in 4 user stories, 2 foundational phases, with MVP = US1 + US2 (both P1).

**Parallel Opportunities**:

- Phase 1 (Setup) tasks run in parallel: different file creates
- Phase 2 (Foundational) task runs independently
- Phase 3 (US1) and Phase 4 (US2) can run in parallel after foundational is complete (extend different layers)
- Phase 5 (US3) and Phase 6 (US4) are non-blocking, can start after US1 is testable

**MVP Delivery**: Phases 1-2 + Phase 3 + Phase 4 = user can schedule todos and can't complete them early. ~2-3 days of dev.

---

## Phase 0: Constitution Alignment _(Quality Gates)_

**Purpose**: Verify feature design aligns with SolidJS Constitution v1.0.0

- [x] T000 [P] Review feature against Performance Excellence principle (pure date comparisons O(1), no new deps, minimal render impact)
- [x] T001 [P] Review feature against Readable Abstractions principle (component names: `ScheduledTodoBadge`, `DatePicker`; props typed)
- [x] T002 [P] Review feature against Program Efficiency principle (zero deps, state co-located, CSS-only styling)
- [x] T003 [P] Review feature against Observable Behavior principle (error messages on completion block, no async ops)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and extend existing structure per plan

- [x] T004 [P] Create `src/utils/scheduled-todos.js` with stub functions for: `isScheduledForFuture()`, `canCompleteTodo()`, `calculateOverdueStatus()`, `getTodoStatus()`, `formatScheduledDate()`, `validateScheduledDate()`
- [x] T005 [P] Create `src/components/DatePicker.jsx` with props: `value`, `onChange`, `minDate`, `disabled`, `label`; render native `<input type="date">` (browser-native for MVP)
- [x] T006 [P] Create `src/components/ScheduledTodoBadge.jsx` with props: `todo`, `today` (optional); render date badge or overdue indicator
- [x] T007 [P] Create `src/index.css` stubs for new classes: `.todo-badge-scheduled`, `.todo-badge-ready`, `.todo-badge-overdue`, `.todo-complete-button:disabled`

---

## Phase 2: Foundational (Data Model Extension)

**Purpose**: Extend Todo entity and storage with new fields; ensure backward compatibility

**⚠️ CRITICAL**: Foundational work must complete before any user story implementation

- [x] T008 Extend `src/App.jsx` store to include `scheduledDate`, `completedAt`, `isOverdue` fields in Todo type
- [x] T009 Update `src/App.jsx` todo load function to parse `scheduledDate` and `isOverdue` from localStorage (handle undefined gracefully for existing todos)
- [x] T010 Update `src/App.jsx` todo save function to persist `scheduledDate`, `completedAt`, `isOverdue` to localStorage
- [x] T011 Create test cases for backward compatibility: load old todo (no scheduled fields) → continue to work unchanged

**Checkpoint**: Foundation complete - existing todos still work, new fields in data model ready for user story work

---

## Phase 3: User Story 1 - Create a Todo for a Future Date (Priority: P1) 🎯 MVP

**Goal**: Users can add todos scheduled for any future date with clear date display

**Independent Test**: Create todo → select May 20 → verify appears in list with date badge showing "May 20"

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement `validateScheduledDate(dateString)` in `src/utils/scheduled-todos.js`: validate date is today or future; return error message or null
- [ ] T013 [P] [US1] Implement `formatScheduledDate(dateString, locale)` in `src/utils/scheduled-todos.js`: return localized date string (e.g., "May 15")
- [ ] T014 [US1] Extend `src/components/TodoForm.jsx` (or todo creation section in App.jsx): add DatePicker field for optional scheduled date
- [ ] T015 [US1] Update create todo handler in `src/App.jsx`: accept scheduledDate parameter; validate with `validateScheduledDate()`; store in todo object
- [ ] T016 [P] [US1] Implement `isScheduledForFuture(todo)` in `src/utils/scheduled-todos.js`: return true if scheduledDate exists and > today
- [ ] T017 [US1] Extend `src/components/TodoItem.jsx`: render ScheduledTodoBadge component for each todo (shows date if scheduled)
- [ ] T018 [P] [US1] Add CSS for `.todo-badge-scheduled` in `src/index.css`: blue background, small font, rounded corners
- [ ] T019 [US1] Test User Story 1: Create todo for tomorrow → verify date badge appears with correct date

---

## Phase 4: User Story 2 - Complete a Todo Only on or After Scheduled Date (Priority: P1) 🎯 MVP

**Goal**: Prevent completing scheduled todos before their scheduled date with clear user message

**Independent Test**: Create todo for tomorrow → try to mark complete today → button disabled, message shows "Available after May 20" → advance to tomorrow → button enabled, marks complete

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement `isScheduledForFuture(todo)` in `src/utils/scheduled-todos.js`: return true if todo has scheduledDate in future relative to today
- [ ] T021 [P] [US2] Implement `isTodoDueToday(todo, today)` in `src/utils/scheduled-todos.js`: return true if scheduledDate equals today
- [ ] T022 [P] [US2] Implement `canCompleteTodo(todo, today)` in `src/utils/scheduled-todos.js`: return false if todo.completed or if scheduledDate > today; true otherwise
- [ ] T023 [US2] Extend `src/components/TodoItem.jsx`: compute `canComplete = canCompleteTodo(todo)`; disable complete button if !canComplete
- [ ] T024 [US2] Extend `src/components/TodoItem.jsx`: add tooltip/title to complete button with message from `canCompleteTodo()` logic (e.g., "Available after May 20")
- [ ] T025 [P] [US2] Add CSS for `.todo-complete-button:disabled` in `src/index.css`: gray color, opacity 0.5, cursor not-allowed
- [ ] T026 [US2] Update complete todo handler in `src/App.jsx`: call `canCompleteTodo()` before allowing completion; show error message if false
- [ ] T027 [US2] Test User Story 2 (Phase A): Create todo for tomorrow → button disabled, tooltip shows date → advance system date to tomorrow → button enabled
- [ ] T028 [US2] Test User Story 2 (Phase B): Create todo for today → button enabled immediately → mark complete → succeeds with no error

---

## Phase 5: User Story 3 - Automatically Mark Todos as Overdue (Priority: P2)

**Goal**: Flag todos completed >1 day after scheduled date so users can see which tasks were late

**Independent Test**: Create todo for May 15 → complete it May 17 → verify marked as overdue (isOverdue: true stored)

### Implementation for User Story 3

- [ ] T029 [P] [US3] Implement `calculateOverdueStatus(scheduledDate, completedDate)` in `src/utils/scheduled-todos.js`: calculate daysBetween; return true if > 1 day
- [ ] T030 [US3] Update complete todo handler in `src/App.jsx`: after marking complete, set `completedAt: new Date().toISOString()`
- [ ] T031 [US3] Update complete todo handler in `src/App.jsx`: if todo has scheduledDate, call `calculateOverdueStatus()` and set `isOverdue` flag; persist to storage
- [ ] T032 [US3] Extend `src/components/ScheduledTodoBadge.jsx`: if todo.completed and isOverdue, render overdue indicator (e.g., red "⚠️ OVERDUE" label)
- [ ] T033 [P] [US3] Add CSS for `.todo-badge-overdue` in `src/index.css`: red background, bold text, alert styling
- [ ] T034 [US3] Test User Story 3 (Phase A): Create todo for May 15 → complete on May 15 → verify isOverdue: false stored, no overdue indicator shown
- [ ] T035 [US3] Test User Story 3 (Phase B): Create todo for May 15 → complete on May 16 (1 day) → verify isOverdue: false, no indicator
- [ ] T036 [US3] Test User Story 3 (Phase C): Create todo for May 15 → complete on May 17 (2 days) → verify isOverdue: true, overdue indicator shown

---

## Phase 6: User Story 4 - View Scheduled vs. Overdue Todos (Priority: P2)

**Goal**: Visually distinguish todo states so users can reflect on their task completion patterns

**Independent Test**: View list with pending, scheduled, ready, completed-on-time, and completed-overdue todos → each appears visually distinct

### Implementation for User Story 4

- [ ] T037 [P] [US4] Implement `getTodoStatus(todo, today)` in `src/utils/scheduled-todos.js`: return one of 'pending', 'scheduled', 'ready', 'completed_on_time', 'completed_overdue'
- [ ] T038 [US4] Extend `src/components/TodoItem.jsx`: compute status = getTodoStatus(todo); apply status as CSS class: `.todo-status-{status}`
- [ ] T039 [P] [US4] Add CSS classes in `src/index.css`:
  - `.todo-status-pending`: default styling
  - `.todo-status-scheduled`: blue tint, locked icon
  - `.todo-status-ready`: green tint, ready indicator
  - `.todo-status-completed-on-time`: strikethrough, gray
  - `.todo-status-completed-overdue`: strikethrough, red
- [ ] T040 [US4] Test User Story 4: Create todos in all states (unscheduled, scheduled for future, scheduled for today, completed on-time, completed overdue) → verify each has distinct visual appearance
- [ ] T041 [US4] Test reload persistence: Create todos in all states → reload app → verify visual states persist (via isOverdue and scheduledDate fields)

---

## Phase 7: Polish & Documentation

**Purpose**: Clean up, test edge cases, write documentation

- [ ] T042 [P] Add JSDoc comments to all exported functions in `src/utils/scheduled-todos.js`
- [ ] T043 [P] Add TypeScript or JSDoc type annotations to component props in `src/components/DatePicker.jsx` and `src/components/ScheduledTodoBadge.jsx`
- [ ] T044 Unit test `src/utils/scheduled-todos.js`: test date comparison edge cases (midnight, leap years, DST transitions, far future dates)
- [ ] T045 Unit test backward compatibility: old todos without scheduledDate fields load correctly
- [ ] T046 Integration test: Full user journey—create scheduled todo → attempt early completion → block with message → advance date → complete → verify overdue status
- [ ] T047 Manual QA: Test in multiple browsers (Chrome, Firefox, Safari) to verify native date picker behavior consistent
- [ ] T048 [P] Review CSS for accessibility: verify contrast ratios, focus states for button disable, semantic HTML used
- [ ] T049 [P] Review component naming and code structure per Constitution readability principle
- [ ] T050 Update [README.md](../../README.md) with feature description: "Todos can now be scheduled for future dates with completion constraints"

---

## Implementation Strategy & Parallel Execution

### MVP Delivery (P1 Stories Only)

**Recommended sequence**:

1. **Sequential**: Phase 1 (setup) → Phase 2 (data model) → (Phase 3 + Phase 4 in parallel)
2. **Phase 1 Tasks**: ~30 min (5 files created, mostly stubs)
3. **Phase 2 Tasks**: ~1 hour (extend App.jsx store and save/load logic)
4. **Phase 3 Tasks**: ~1.5 hours (validate dates, render form, extend TodoItem)
5. **Phase 4 Tasks**: ~1.5 hours (implement completion guard, update handlers)
6. **Total MVP**: ~4 hours

### Full Feature (Including P2 Stories)

7. **Phase 5 Tasks**: ~1 hour (overdue calculation, update UI)
8. **Phase 6 Tasks**: ~1.5 hours (status enum, CSS styling, visual distinctions)
9. **Phase 7 Tasks**: ~2 hours (testing, docs, accessibility review)
10. **Total Full Feature**: ~8.5 hours

### Parallel Execution Opportunities

| Phase       | Parallel Tasks                                              | Independent?                  |
| ----------- | ----------------------------------------------------------- | ----------------------------- |
| Phase 1     | T004, T005, T006, T007                                      | Yes (different files)         |
| Phase 2     | None (sequential data model changes)                        | No                            |
| Phase 3 + 4 | T012-T018 (US1) vs. T020-T026 (US2)                         | Yes (extend different layers) |
| Phase 5     | T029 (util) can run while T030-T033 (UI) planned            | Mostly sequential             |
| Phase 6     | T037 (util) must complete before T038-T040                  | Sequential                    |
| Phase 7     | T042-T043 (comments), T044-T045 (tests), T047-T049 (review) | Yes (mostly independent)      |

---

## Success Criteria per Story

### User Story 1 ✓

- [ ] Todos can be created with optional scheduledDate
- [ ] Scheduled date displays in todo list (e.g., "May 15")
- [ ] Unscheduled todos still work (no required date field)
- [ ] Date is persisted to localStorage and survives reload

### User Story 2 ✓

- [ ] Complete button is disabled for future-scheduled todos
- [ ] Disabled button shows tooltip: "Available after [date]"
- [ ] On scheduled date, button becomes enabled
- [ ] Can complete on scheduled date or any day after
- [ ] Unscheduled todos can complete immediately (unchanged)

### User Story 3 ✓

- [ ] Todo completed same day as scheduled: isOverdue = false
- [ ] Todo completed 1 day after: isOverdue = false
- [ ] Todo completed 2+ days after: isOverdue = true
- [ ] isOverdue flag persisted to localStorage
- [ ] Overdue indicator displays in UI when isOverdue = true

### User Story 4 ✓

- [ ] Pending todos (no date) visually distinct
- [ ] Scheduled todos (future date) visually distinct (locked, future indicator)
- [ ] Ready todos (today's date) visually distinct (green, ready)
- [ ] Completed on-time todos visually distinct (strikethrough, gray)
- [ ] Completed overdue todos visually distinct (strikethrough, red, warning icon)
- [ ] States persist after app reload

---

## Notes & Constraints

- **No new dependencies**: All date logic uses native `Date` and ISO 8601 strings
- **Browser date picker**: MVP uses native `<input type="date">` for simplicity; can be replaced with calendar widget later
- **localStorage persistence**: Existing app save/load already handles optional fields; no migration needed
- **Timezone handling**: Device timezone used for all comparisons (per spec assumption)
- **Day-only scheduling**: No time-of-day component; scheduled dates always normalized to midnight UTC for comparison
- **Immutable overdue flag**: Once calculated at completion time, never changes (supports audit trail and fast lookup)

---

## Dependency Chain

```
Phase 1 (Setup files)
  ↓
Phase 2 (Data model extension) — BLOCKING
  ↓
Phase 3 (US1: Create) ←→ Phase 4 (US2: Prevent early)  [can run in parallel]
  ↓
Phase 5 (US3: Overdue flag)
  ↓
Phase 6 (US4: Visual states)
  ↓
Phase 7 (Polish)
```

---

## Test Coverage Summary

| Test Type     | Story         | Location                             | Scope                               |
| ------------- | ------------- | ------------------------------------ | ----------------------------------- |
| Unit          | US1, US2, US3 | `src/utils/scheduled-todos.js` tests | Date logic, edge cases              |
| Integration   | US1 + US2     | E2E workflow test                    | Create, prevent, complete           |
| UI            | US4           | Visual inspection                    | CSS classes applied, states visible |
| Regression    | All           | Load old todos test                  | Backward compatibility              |
| Accessibility | All           | Manual review                        | Contrast, focus, semantics          |

---

## Deliverables Checklist

- [ ] Code changes in `src/` per task file paths
- [ ] localStorage data persists across reload
- [ ] All 4 user stories implemented and independently testable
- [ ] Documentation: README updated, code comments added
- [ ] Accessibility: WCAG contrast, focus states verified
- [ ] Performance: Bundle size impact <1KB (measured with `npm run build`)
- [ ] No console errors or warnings

---

## Ready for Implementation! 🚀

All tasks defined. No blockers. Start with Phase 1 setup tasks (can parallelize all 4 files).
