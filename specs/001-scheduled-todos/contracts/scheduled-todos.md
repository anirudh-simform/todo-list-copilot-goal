# Contract: scheduled-todos Utility Module

**Version**: 1.0  
**Export**: `src/utils/scheduled-todos.js`  
**Type**: Pure utility functions (no side effects)  
**Dependencies**: None (vanilla JavaScript)

## Function Contracts

### 1. isScheduledForFuture(todo: Todo) → boolean

**Purpose**: Determine if a todo is scheduled for a future date.

**Input**:

- `todo: Todo` — Todo object with optional `scheduledDate` field

**Output**: `boolean` — true if `scheduledDate` exists and is in the future; false otherwise

**Behavior**:

```javascript
isScheduledForFuture({ scheduledDate: "2026-05-20T00:00:00.000Z" }); // true if today < May 20
isScheduledForFuture({ scheduledDate: "2026-05-12T00:00:00.000Z" }); // false if today >= May 12
isScheduledForFuture({
  /* no scheduledDate */
}); // false
```

**Side Effects**: None

---

### 2. isTodoDueToday(todo: Todo, today?: Date) → boolean

**Purpose**: Check if a todo's scheduled date is today.

**Input**:

- `todo: Todo` — Todo object
- `today?: Date` — Reference date (default: today); for testing

**Output**: `boolean` — true if scheduled date equals today

**Behavior**:

```javascript
// Assuming today is 2026-05-12
isTodoDueToday({ scheduledDate: "2026-05-12T00:00:00.000Z" }); // true
isTodoDueToday({ scheduledDate: "2026-05-13T00:00:00.000Z" }); // false
isTodoDueToday({
  /* no scheduledDate */
}); // false
```

**Side Effects**: None

---

### 3. canCompleteTodo(todo: Todo, today?: Date) → boolean

**Purpose**: Determine if a user is allowed to mark a todo as complete today.

**Input**:

- `todo: Todo` — Todo object
- `today?: Date` — Reference date (default: today); for testing

**Output**: `boolean` — true if todo can be marked complete; false if blocked by scheduled date

**Behavior**:

```javascript
// Assuming today is 2026-05-12
canCompleteTodo({ completed: true }); // false (already complete)
canCompleteTodo({
  completed: false,
  scheduledDate: "2026-05-20T00:00:00.000Z",
}); // false (future date)
canCompleteTodo({
  completed: false,
  scheduledDate: "2026-05-12T00:00:00.000Z",
}); // true (today or past)
canCompleteTodo({ completed: false /* no scheduledDate */ }); // true (unscheduled)
```

**Side Effects**: None

**UI Integration**: Disable complete button if returns false; show tooltip with reason.

---

### 4. calculateOverdueStatus(scheduledDate: string, completedDate: string) → boolean

**Purpose**: Determine if a completed todo was completed overdue (>1 day after scheduled).

**Input**:

- `scheduledDate: string` — ISO 8601 date when todo was scheduled
- `completedDate: string` — ISO 8601 timestamp when todo was marked complete

**Output**: `boolean` — true if completed >1 day after scheduled date; false if on-time

**Behavior**:

```javascript
calculateOverdueStatus("2026-05-15T00:00:00.000Z", "2026-05-15T14:30:00.000Z"); // false (same day)
calculateOverdueStatus("2026-05-15T00:00:00.000Z", "2026-05-16T09:00:00.000Z"); // false (1 day later)
calculateOverdueStatus("2026-05-15T00:00:00.000Z", "2026-05-17T08:00:00.000Z"); // true (2 days later)
```

**Calculation**:

```javascript
const daysBetween = Math.floor(
  (new Date(completedDate) - new Date(scheduledDate)) / (1000 * 60 * 60 * 24),
);
return daysBetween > 1;
```

**Side Effects**: None

---

### 5. getTodoStatus(todo: Todo, today?: Date) → TodoStatus

**Purpose**: Get the current state of a todo (derived, read-only).

**Input**:

- `todo: Todo` — Todo object
- `today?: Date` — Reference date (default: today); for testing

**Output**: `TodoStatus` — One of: `'pending' | 'scheduled' | 'ready' | 'completed_on_time' | 'completed_overdue'`

**Behavior**:

```javascript
getTodoStatus({ completed: false /* no scheduledDate */ }); // 'pending'
getTodoStatus({ completed: false, scheduledDate: "2026-05-20T00:00:00.000Z" }); // 'scheduled' (if today < 20)
getTodoStatus({ completed: false, scheduledDate: "2026-05-12T00:00:00.000Z" }); // 'ready' (if today >= 12)
getTodoStatus({ completed: true, isOverdue: false }); // 'completed_on_time'
getTodoStatus({ completed: true, isOverdue: true }); // 'completed_overdue'
```

**Side Effects**: None

**UI Integration**: Use to style todo appearance (color, strikethrough, badge).

---

### 6. formatScheduledDate(dateString: string, locale?: string) → string

**Purpose**: Format a scheduled date for display to users.

**Input**:

- `dateString: string` — ISO 8601 date string
- `locale?: string` — BCP 47 language tag (default: `'en-US'`)

**Output**: `string` — Formatted date string (e.g., "May 15", "15. Mai", "15 mai")

**Behavior**:

```javascript
formatScheduledDate("2026-05-15T00:00:00.000Z", "en-US"); // "May 15" (or "5/15" depending on locale)
formatScheduledDate("2026-05-15T00:00:00.000Z", "de-DE"); // "15. Mai"
formatScheduledDate("2026-05-15T00:00:00.000Z", "fr-FR"); // "15 mai"
```

**Implementation Note**: Use `Intl.DateTimeFormat` or `Date.toLocaleDateString()` for locale support.

**Side Effects**: None

**UI Integration**: Display in todo item and badge: `formatScheduledDate(todo.scheduledDate)`

---

### 7. validateScheduledDate(dateString?: string) → string | null

**Purpose**: Validate a scheduled date input before saving.

**Input**:

- `dateString?: string` — ISO 8601 date string (or undefined for unscheduled)

**Output**: `string | null` — Error message if invalid; null if valid

**Behavior**:

```javascript
validateScheduledDate(undefined); // null (optional field)
validateScheduledDate("2026-05-20T00:00:00.000Z"); // null (valid future date)
validateScheduledDate("2026-05-10T00:00:00.000Z"); // "Scheduled date must be today or in the future" (if today > May 10)
validateScheduledDate("invalid-date-string"); // "Invalid date format"
```

**Validation Rules**:

1. If `undefined`, return null (optional)
2. If string, parse as ISO 8601
3. If parse fails, return "Invalid date format"
4. If date is before today, return "Scheduled date must be today or in the future"
5. Otherwise, return null (valid)

**Side Effects**: None

**UI Integration**: Call on form submit; display error message if not null.

---

## Component Contracts

### ScheduledTodoBadge Component

**File**: `src/components/ScheduledTodoBadge.jsx`

**Purpose**: Display visual indicator of a todo's scheduled date or overdue status.

**Props**:

```typescript
interface ScheduledTodoBadgeProps {
  todo: Todo; // Todo object with optional scheduledDate, isOverdue
  today?: Date; // Reference date for testing (default: today)
}
```

**Renders**:

- If no `scheduledDate`: Nothing (or null)
- If `scheduledDate` and not completed: Colored badge with date (e.g., "May 15" in blue)
- If `scheduledDate` and completed with `isOverdue: false`: Date badge with checkmark (gray)
- If `scheduledDate` and completed with `isOverdue: true`: Red "OVERDUE" label + date

**Example**:

```jsx
<ScheduledTodoBadge todo={{ scheduledDate: '2026-05-15T00:00:00.000Z', completed: false }} />
// Output: <span class="todo-badge-scheduled">May 15</span>

<ScheduledTodoBadge todo={{ scheduledDate: '2026-05-15T00:00:00.000Z', completed: true, isOverdue: true }} />
// Output: <span class="todo-badge-overdue">⚠️ OVERDUE</span>
```

**CSS Classes**:

- `.todo-badge-scheduled` — Styled for future-scheduled todos (blue, smaller font)
- `.todo-badge-ready` — Styled for todos ready to complete (green)
- `.todo-badge-overdue` — Styled for overdue todos (red, bold)

---

### DatePicker Component

**File**: `src/components/DatePicker.jsx`

**Purpose**: Allow user to select a future date for scheduling.

**Props**:

```typescript
interface DatePickerProps {
  value?: Date | string; // Current selected date (ISO 8601 string or Date object)
  onChange: (date: Date) => void; // Callback when date selected
  minDate?: Date | string; // Minimum selectable date (default: today)
  disabled?: boolean; // Whether picker is disabled
  label?: string; // Form label (default: "Schedule Date")
}
```

**Behavior**:

- Renders calendar or native date input (browser-dependent)
- Disables all dates before `minDate` (default: today)
- On date selection, calls `onChange(selectedDate)` with Date object
- Returns ISO 8601 date string (day-only, midnight UTC)

**Example**:

```jsx
<DatePicker
  value={todo.scheduledDate}
  onChange={(date) => handleScheduleChange(todo.id, date)}
  minDate={new Date()}
/>
```

---

## Integration Points

### In App.jsx (Main Store)

1. **On Todo Creation**:

   ```javascript
   const createTodo = (title, description, scheduledDate) => {
     const errors = validateScheduledDate(scheduledDate);
     if (errors) return showError(errors);

     const todo = {
       id: generateId(),
       title,
       description,
       scheduled_date: scheduledDate || undefined,
       created_at: new Date().toISOString(),
       completed: false,
     };
     saveTodo(todo);
   };
   ```

2. **On Todo Completion**:
   ```javascript
   const completeTodo = (todoId) => {
     const todo = todos.find((t) => t.id === todoId);

     if (!canCompleteTodo(todo)) {
       return showError(`This todo is scheduled for ${formatScheduledDate(todo.scheduledDate)}. 
                        It can only be marked complete on or after that date.`);
     }

     const updated = {
       ...todo,
       completed: true,
       completed_at: new Date().toISOString(),
       is_overdue: todo.scheduled_date
         ? calculateOverdueStatus(todo.scheduled_date, new Date().toISOString())
         : undefined,
     };
     updateTodo(updated);
   };
   ```

### In TodoItem.jsx Component

```javascript
const disableCompleteButton = !canCompleteTodo(todo);
const tooltipMessage = canCompleteTodo(todo)
  ? null
  : `Available after ${formatScheduledDate(todo.scheduledDate)}`;

return (
  <li class="todo-item" classList={{ [getTodoStatus(todo)]: true }}>
    <span>{todo.title}</span>
    <ScheduledTodoBadge todo={todo} />
    <button
      disabled={disableCompleteButton}
      title={tooltipMessage}
      onClick={() => completeTodo(todo.id)}
    >
      ✓ Complete
    </button>
  </li>
);
```

---

## Error Handling Contract

| Scenario                                          | Behavior                                            | Error Message                                                                              |
| ------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Invalid `dateString` in `validateScheduledDate()` | Return error                                        | "Invalid date format"                                                                      |
| Past date in `validateScheduledDate()`            | Return error                                        | "Scheduled date must be today or in the future"                                            |
| Attempt to complete before scheduled date         | Block action                                        | "This todo is scheduled for [date]. It can only be marked complete on or after that date." |
| localStorage quota exceeded                       | Existing app logic applies (no new handling needed) | App-level error handling                                                                   |

---

## Performance Contract

- All functions execute in **<1ms** (date comparisons are O(1))
- No DOM operations (pure logic functions)
- No network requests
- SolidJS `createMemo` should wrap derived signals to avoid re-renders:
  ```javascript
  const status = createMemo(() => getTodoStatus(todo));
  const isCompletable = createMemo(() => canCompleteTodo(todo));
  ```

---

## Summary

This contract defines a clean, pure interface for scheduled todo functionality. All functions are stateless, deterministic (same input → same output), and testable. Component props are explicitly typed. Integration points are documented with example code.
