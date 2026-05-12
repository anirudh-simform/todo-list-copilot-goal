# Quickstart: Implementing Scheduled Todos

**Audience**: Developers implementing this feature  
**Time to Understand**: ~15 minutes  
**Scope**: User workflows and implementation entry points

---

## User Workflows

### Workflow 1: Create a Scheduled Todo

1. User opens app, clicks **"Add Todo"** button
2. Form appears with fields: Title, Description, **[NEW] Scheduled Date**
3. User enters title: _"Prepare quarterly report"_
4. User clicks date picker (or empty date field) → Calendar appears
5. User clicks future date: _"May 20"_
6. User clicks **"Save"**
7. Todo appears in list with date badge: **"May 20"**

**Implementation Touchpoints**:

- `components/TodoForm.jsx` (or create section) → Add `<DatePicker />` component
- `components/DatePicker.jsx` (new) → Render calendar, disable past dates
- `App.jsx` → Pass `scheduledDate` to todo creation function
- `utils/scheduled-todos.js` → Export `validateScheduledDate(date)` function

---

### Workflow 2: Attempt to Complete a Scheduled Todo (Early)

1. User views todo scheduled for _May 20_, today is _May 18_
2. User hovers/clicks complete button
3. Button appears **disabled** (grayed out) with tooltip:
   - _"Available after May 20"_
4. User cannot mark it complete

**Implementation Touchpoints**:

- `components/TodoItem.jsx` → Check `canCompleteTodo(todo)` before enabling button
- `utils/scheduled-todos.js` → Export `canCompleteTodo(todo, today)` function
- `index.css` → Style disabled button state

---

### Workflow 3: Complete a Todo On-Time

1. User views todo scheduled for _May 20_, today is _May 20_
2. Complete button is **enabled**
3. User clicks, todo marks complete
4. Todo displays with **no overdue indicator** (shows ✓ or strikethrough)
5. On reopen, todo still shows as completed on-time

**Implementation Touchpoints**:

- `components/TodoItem.jsx` → `canCompleteTodo()` returns true; mark complete
- `App.jsx` → Call completion handler with `completedAt: new Date().toISOString()`
- `utils/scheduled-todos.js` → `calculateOverdueStatus(scheduledDate, completedAt)` returns `false`

---

### Workflow 4: Complete a Todo Late (Overdue)

1. User views todo scheduled for _May 20_, today is _May 22_ (2 days late)
2. Complete button is **enabled**
3. User clicks, todo marks complete
4. Todo displays with **"Overdue" label/badge** (red or warning color)
5. On reopen, overdue status persists

**Implementation Touchpoints**:

- `components/TodoItem.jsx` → Check `isOverdue` flag; render `<ScheduledTodoBadge />` with overdue state
- `App.jsx` → Call completion handler; calculate and store `isOverdue: true`
- `utils/scheduled-todos.js` → Export `calculateOverdueStatus(scheduledDate, completedAt)` → returns `true` if `daysBetween(scheduled, completed) > 1`
- `index.css` → Add `.todo-overdue` class for styling

---

### Workflow 5: View List with Mixed Todo States

1. User opens app, sees list with:
   - **Pending todos** (no date): _"Unscheduled task"_ (no badge)
   - **Scheduled todos** (future date): _"May 25 · Future task"_ (blue badge)
   - **Ready todos** (today or past, not completed): _"May 18 · Ready to do"_ (green badge, enabled button)
   - **Completed on-time**: _"May 15 · ✓ Completed on time"_ (gray, strikethrough)
   - **Completed overdue**: _"May 15 · ⚠️ OVERDUE · ✓ Completed"_ (red badge, strikethrough)

**Implementation Touchpoints**:

- `components/TodoItem.jsx` → Render `<ScheduledTodoBadge />` conditionally
- `components/ScheduledTodoBadge.jsx` (new) → Show date + status indicator
- `utils/scheduled-todos.js` → Export `getTodoStatus(todo)` and `formatScheduledDate(dateString, locale)`
- `index.css` → Add color classes: `.todo-badge-scheduled`, `.todo-badge-ready`, `.todo-badge-overdue`

---

## Implementation Checklist

### Phase 1: Core Data Model & Utilities

- [ ] **Create `src/utils/scheduled-todos.js`** with these functions:

  ```javascript
  export function isScheduledForFuture(todo) { ... }
  export function isTodoDueToday(todo) { ... }
  export function canCompleteTodo(todo, today = new Date()) { ... }
  export function calculateOverdueStatus(scheduledDate, completedDate) { ... }
  export function getTodoStatus(todo, today = new Date()) { ... }
  export function formatScheduledDate(dateString, locale = 'en-US') { ... }
  export function validateScheduledDate(dateString) { ... }
  ```

  - **Testing**: Write unit tests for edge cases (midnight, leap years, etc.)

- [ ] **Extend data model in `App.jsx`** or store function:
  - Todo now has optional `scheduledDate`, `completedAt`, `isOverdue` fields
  - Update `localStorage` write to persist new fields
  - Update `localStorage` read to parse new fields (handle undefined gracefully)

### Phase 2: UI Components

- [ ] **Create `src/components/DatePicker.jsx`**:
  - Props: `value?: Date`, `onChange: (date: Date) => void`, `minDate?: Date`
  - Render calendar with past dates disabled
  - Return ISO date string on selection

- [ ] **Create `src/components/ScheduledTodoBadge.jsx`**:
  - Props: `todo: Todo`, `today?: Date`
  - Display: Date badge (e.g., "May 15") + status indicator (icon for scheduled/overdue)
  - CSS classes for styling

- [ ] **Extend `src/components/TodoForm.jsx`** or create one:
  - Add `<DatePicker />` field for scheduling
  - Pass `scheduledDate` to create handler
  - Validate before submit

- [ ] **Extend `src/components/TodoItem.jsx`**:
  - Import `canCompleteTodo()` function
  - Disable complete button if `!canCompleteTodo(todo)`
  - Show tooltip with reason why ("Available after May 20")
  - Import and render `<ScheduledTodoBadge />`

### Phase 3: Business Logic

- [ ] **Extend `App.jsx`** todo creation handler:
  - Accept `scheduledDate` parameter (optional)
  - Validate with `validateScheduledDate()`
  - Store in todo object

- [ ] **Extend `App.jsx`** todo completion handler:
  - Before marking complete, check `canCompleteTodo()`
  - If false, show error message (don't mark complete)
  - If true:
    - Calculate `isOverdue` with `calculateOverdueStatus()`
    - Set `completedAt: new Date().toISOString()`
    - Store `isOverdue` in todo object
    - Persist to localStorage

### Phase 4: Styling

- [ ] **Add CSS to `src/index.css`**:
  ```css
  .todo-badge-scheduled {
    /* Blue, future date */
  }
  .todo-badge-ready {
    /* Green, can complete */
  }
  .todo-badge-overdue {
    /* Red, overdue */
  }
  .todo-complete-button:disabled {
    /* Gray out when can't complete */
  }
  .todo-scheduled-message {
    /* Tooltip text */
  }
  ```

### Phase 5: Testing & QA

- [ ] **Unit tests for `scheduled-todos.js`**:
  - Test date comparisons (midnight, DST, edge cases)
  - Test overdue calculation (0 days, 1 day, 2+ days)
  - Test validation (future dates only)

- [ ] **Integration tests (or manual QA)**:
  - Create todo with future date → displays with badge ✓
  - Try to complete before date → blocked with message ✓
  - Complete on scheduled date → marked on-time ✓
  - Complete 2+ days after → marked overdue ✓
  - Reload app → all state persists ✓

---

## Key Implementation Notes

### 1. Date Normalization

Always normalize dates to midnight UTC for storage and comparison:

```javascript
function normalizeDateToMidnight(date) {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}
```

This ensures "May 20 at 11 PM" and "May 21 at 1 AM" are treated correctly.

### 2. Day Comparison (not millisecond)

For overdue calculation, compare days, not milliseconds:

```javascript
function daysBetween(date1, date2) {
  const start = normalizeDateToMidnight(date1);
  const end = normalizeDateToMidnight(date2);
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
}
```

This avoids issues with time-of-day in completion timestamp.

### 3. Immutable Overdue Flag

Once a todo is completed and `isOverdue` is calculated, it never changes. This means:

- If completed on-time (within 1 day), `isOverdue: false` stays `false` forever.
- If completed overdue (>1 day), `isOverdue: true` stays `true` forever.
- You don't need to recalculate on every render or app load.

### 4. Graceful Degradation

Unscheduled todos (no `scheduledDate`) continue to work as before:

- No button disable
- No "Available after" tooltip
- No overdue indicator
- Can complete immediately

### 5. Performance Optimization

Use SolidJS `createMemo` for derived signals:

```javascript
const todoStatus = createMemo(() => getTodoStatus(todo));
const isCompletable = createMemo(() => canCompleteTodo(todo));
const formattedDate = createMemo(() =>
  todo.scheduledDate ? formatScheduledDate(todo.scheduledDate) : null,
);
```

This prevents unnecessary re-renders of child components (ScheduledTodoBadge, button disable state).

### 6. localStorage Persistence

Update save/load logic:

```javascript
function saveTodos(todos) {
  const json = JSON.stringify(todos); // Already handles optional fields
  localStorage.setItem("todos", json);
}

function loadTodos() {
  const json = localStorage.getItem("todos");
  return json ? JSON.parse(json) : [];
}
```

No migration needed; old todos without `scheduledDate` work as-is.

---

## Testing Edge Cases

Before declaring feature complete, test these scenarios:

| Scenario                                   | Expected Result                                        |
| ------------------------------------------ | ------------------------------------------------------ |
| Create todo for today                      | Can mark complete immediately                          |
| Create todo for tomorrow                   | Cannot mark complete until tomorrow                    |
| Reload app → todo still scheduled tomorrow | Persists correctly                                     |
| Complete todo on scheduled date            | Marked on-time, isOverdue = false                      |
| Complete todo 1 day after scheduled        | Marked on-time (within 1 day grace), isOverdue = false |
| Complete todo 2+ days after scheduled      | Marked overdue, isOverdue = true                       |
| View completed overdue todo → reload app   | Overdue label persists                                 |
| Create unscheduled todo (no date)          | Works as before; can complete immediately              |
| Create scheduled todo → edit date to past  | Should validate and reject                             |

---

## Next Steps

After this quickstart:

1. Read [data-model.md](data-model.md) for complete data contract
2. Read [research.md](research.md) for design decisions and rationale
3. Refer to `/specs/001-scheduled-todos/tasks.md` for detailed implementation tasks
4. Check [spec.md](spec.md) for acceptance criteria and user stories

Good luck! 🚀
