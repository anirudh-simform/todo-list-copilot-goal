# Data Model: Scheduled Todos Feature

**Version**: 1.0  
**Last Updated**: 2026-05-12  
**Stability**: Stable (final design phase)

## Core Entity: Todo (Extended)

### Structure

```typescript
interface Todo {
  // Existing fields
  id: string; // UUID or auto-increment, immutable
  title: string; // Non-empty, max 200 chars
  description?: string; // Optional, max 1000 chars
  completed: boolean; // Existing: completion status
  createdAt: string; // ISO 8601 timestamp (existing)

  // New fields for scheduled todos
  scheduledDate?: string; // ISO 8601 date-only (optional)
  // Format: "2026-05-15T00:00:00.000Z" (midnight UTC)
  // Only present if todo is scheduled
  // Must be >= today for new todos

  completedAt?: string; // ISO 8601 timestamp when marked complete
  // Only present if completed === true
  // Calculated from system date at completion time

  isOverdue?: boolean; // Derived: true if completed >1 day after scheduledDate
  // Calculated once at completion time, then persisted
  // Only present if completed === true and scheduledDate was set
}
```

### Field Descriptions

| Field           | Type                   | Constraints            | Semantics                                                         |
| --------------- | ---------------------- | ---------------------- | ----------------------------------------------------------------- |
| `id`            | `string`               | Non-empty, unique      | Immutable identifier assigned at creation                         |
| `title`         | `string`               | Non-empty, 1–200 chars | User-facing todo label                                            |
| `description`   | `string \| undefined`  | 0–1000 chars           | Optional detailed notes                                           |
| `completed`     | `boolean`              | Always present         | Completion state; false on creation, true when marked done        |
| `createdAt`     | `string`               | ISO 8601 format        | Immutable creation timestamp                                      |
| `scheduledDate` | `string \| undefined`  | ISO 8601, date-only    | Day todo is planned to be completed; absent for unscheduled todos |
| `completedAt`   | `string \| undefined`  | ISO 8601 format        | Timestamp when marked complete; absent if not completed           |
| `isOverdue`     | `boolean \| undefined` | true or false          | Overdue indicator; absent if incomplete or no scheduled date      |

### Invariants

1. **Scheduled date must be future or today**: If `scheduledDate` is present, `new Date(scheduledDate) >= today`.
2. **Completion requires scheduled date to pass**: If `scheduledDate` is set, can only mark `completed: true` when `today >= scheduledDate` (enforced by UI/business logic).
3. **Overdue only if scheduled**: `isOverdue` field only exists when `scheduledDate` is set and `completed: true`.
4. **Overdue calculation is immutable**: Once `isOverdue` is calculated and stored (at completion time), it never changes, even if system date advances further.
5. **Created date is immutable**: `createdAt` never changes after initial creation.

### Validation Rules

#### On Creation

```javascript
function validateNewTodo(todo: Partial<Todo>): string[] {
  const errors = [];

  if (!todo.title || todo.title.trim().length === 0) {
    errors.push("Title is required and cannot be empty");
  }
  if (todo.title && todo.title.length > 200) {
    errors.push("Title must not exceed 200 characters");
  }
  if (todo.description && todo.description.length > 1000) {
    errors.push("Description must not exceed 1000 characters");
  }

  if (todo.scheduledDate) {
    const scheduled = new Date(todo.scheduledDate);
    const today = startOfDay(new Date());
    if (scheduled < today) {
      errors.push("Scheduled date must be today or in the future");
    }
  }

  return errors;
}
```

#### On Completion

```javascript
function validateCompletion(todo: Todo, today: Date = new Date()): string | null {
  if (todo.completed) {
    return "Todo is already completed";
  }

  if (todo.scheduledDate) {
    const scheduled = new Date(todo.scheduledDate);
    const todayNorm = startOfDay(today);
    if (scheduled > todayNorm) {
      return `This todo is scheduled for ${scheduled.toLocaleDateString()}.
              It can only be marked complete on or after that date.`;
    }
  }

  return null; // Valid, can complete
}
```

---

## State Transitions

### Todo Lifecycle States

```
Pending (unscheduled)
  ├─ Mark Complete ──> Completed On-Time
  └─ Schedule for future date ──> Scheduled (for future)

Scheduled (for future)
  ├─ Advance system date to scheduled date ──> Ready to Complete
  ├─ Advance system date past scheduled date ──> Ready to Complete (Overdue window)
  └─ Edit scheduled date ──> Scheduled (for new date) [if update feature added]

Ready to Complete (scheduled date = today or past)
  ├─ Mark Complete same day as scheduled ──> Completed On-Time
  └─ Mark Complete 1+ day after scheduled ──> Completed On-Time (if <=1 day) or Completed Overdue (if >1 day)

Completed On-Time
  └─ [immutable] (terminal state)

Completed Overdue
  └─ [immutable] (terminal state)
```

### State Enum (Derived, Read-Only)

```typescript
type TodoStatus =
  | "pending" // No scheduled date, not completed
  | "scheduled" // Scheduled date in future, not completed
  | "ready" // Scheduled date = today or past, not completed
  | "completed_on_time" // Completed on/before scheduled date + 1 day
  | "completed_overdue"; // Completed >1 day after scheduled date

function getTodoStatus(todo: Todo, today: Date = new Date()): TodoStatus {
  if (!todo.completed) {
    if (!todo.scheduledDate) return "pending";

    const scheduled = new Date(todo.scheduledDate);
    const todayStart = startOfDay(today);

    if (scheduled > todayStart) return "scheduled";
    return "ready";
  }

  // completed === true
  if (!todo.scheduledDate) return "completed_on_time"; // Unscheduled todos are "on-time" by default
  if (todo.isOverdue) return "completed_overdue";
  return "completed_on_time";
}
```

---

## Relationships

### Parent: Nothing (standalone entity)

Todos are independent entities. No foreign keys to other entities.

### Children: None in v1

Future versions might have:

- `TodoReminder` (notification for scheduled date)
- `TodoHistory` (audit trail of state changes)

These are out of scope for this feature.

---

## Storage Format

### In localStorage

```json
{
  "todos": [
    {
      "id": "abc123",
      "title": "Prepare presentation",
      "description": "For Q2 review meeting",
      "completed": false,
      "createdAt": "2026-05-12T10:30:00.000Z",
      "scheduledDate": "2026-05-20T00:00:00.000Z"
    },
    {
      "id": "def456",
      "title": "Buy groceries",
      "description": "",
      "completed": true,
      "createdAt": "2026-05-11T14:15:00.000Z",
      "completedAt": "2026-05-12T16:45:00.000Z",
      "scheduledDate": "2026-05-12T00:00:00.000Z",
      "isOverdue": false
    },
    {
      "id": "ghi789",
      "title": "Submit tax documents",
      "description": "File with accountant",
      "completed": true,
      "createdAt": "2026-04-01T09:00:00.000Z",
      "completedAt": "2026-05-15T11:30:00.000Z",
      "scheduledDate": "2026-05-01T00:00:00.000Z",
      "isOverdue": true
    }
  ]
}
```

### Serialization Notes

- All dates stored as ISO 8601 strings (human-readable, JSON-safe).
- `scheduledDate` normalized to midnight UTC for consistency.
- `isOverdue` is a boolean (not computed on read; persistent).
- Empty description is empty string `""`, not `null` (matches existing app convention).

---

## Derived Fields & Computed Values

### Computed at Runtime (not persisted)

```typescript
interface TodoComputed {
  status: TodoStatus; // Derived from completed, scheduledDate, today
  daysSinceScheduled: number | null; // Days from scheduledDate to today (null if unscheduled)
  daysUntilScheduled: number | null; // Days from today to scheduledDate (null if unscheduled, negative if past)
  isCompletable: boolean; // Whether user can mark it complete today
}

function computeTodoValues(todo: Todo, today: Date = new Date()): TodoComputed {
  const status = getTodoStatus(todo, today);

  let daysSinceScheduled = null;
  let daysUntilScheduled = null;

  if (todo.scheduledDate) {
    const scheduled = new Date(todo.scheduledDate);
    const diff = daysBetween(scheduled, today);
    if (todo.completed) {
      daysSinceScheduled = diff;
    } else {
      daysUntilScheduled = diff;
    }
  }

  const isCompletable = validateCompletion(todo, today) === null;

  return { status, daysSinceScheduled, daysUntilScheduled, isCompletable };
}
```

---

## Migration & Backward Compatibility

### From Existing Todos (Unscheduled)

Existing todos in localStorage have no `scheduledDate`, `completedAt`, or `isOverdue` fields. They continue to work:

```typescript
function migrateLegacyTodo(legacy: any): Todo {
  return {
    ...legacy,
    // New fields undefined; app treats as unscheduled (no changes to behavior)
  };
}
```

No migration script needed; app reads undefined fields correctly.

### Forward Compatibility

If a future version removes scheduled date support, todos with `scheduledDate` set can still be loaded (fields ignored or shown as "legacy").

---

## Validation Summary Table

| Operation                  | Validation                               | Error Message                                                                              |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Create new todo            | Title non-empty, 1–200 chars             | "Title is required" / "Title exceeds 200 characters"                                       |
| Create with scheduled date | Date >= today                            | "Scheduled date must be today or in the future"                                            |
| Mark as complete           | If scheduled, date must be today or past | "This todo is scheduled for [date]. It can only be marked complete on or after that date." |
| Update scheduled date      | Must be future or today                  | Same as create validation                                                                  |
| Delete                     | No validation (always allowed)           | N/A                                                                                        |

---

## Summary

The Todo entity is minimally extended with 3 optional fields:

- `scheduledDate`: Enables future-date planning.
- `completedAt`: Records when completion occurred (enables overdue calculation).
- `isOverdue`: Immutable flag set at completion time.

All existing todos remain valid. The data model aligns with the Constitution (readable, efficient, no dependencies) and the spec requirements (support all 4 user stories).
