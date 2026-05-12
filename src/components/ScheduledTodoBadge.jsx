import { createMemo } from 'solid-js';
import { getTodoStatus, formatScheduledDate } from '../utils/scheduled-todos';

/**
 * ScheduledTodoBadge Component
 * 
 * Visual indicator of a todo's scheduled date or overdue status
 * Shows nothing for unscheduled todos
 * Shows date badge for scheduled todos
 * Shows overdue indicator for completed overdue todos
 * 
 * Props:
 * - todo: Todo object with optional scheduledDate, completed, isOverdue
 * - today?: Date - Reference date for calculations (default: today)
 */
export default function ScheduledTodoBadge(props) {
  const status = createMemo(() => getTodoStatus(props.todo, props.today));
  const formattedDate = createMemo(() => 
    props.todo.scheduledDate ? formatScheduledDate(props.todo.scheduledDate) : null
  );

  return (
    <div class="scheduled-todo-badge">
      {status() === 'pending' && null}
      
      {status() === 'scheduled' && (
        <span class="todo-badge-scheduled" title={`Scheduled for ${formattedDate()}`}>
          📅 {formattedDate()}
        </span>
      )}
      
      {status() === 'ready' && (
        <span class="todo-badge-ready" title="Ready to complete">
          ✓ {formattedDate()}
        </span>
      )}
      
      {status() === 'completed_on_time' && props.todo.scheduledDate && (
        <span class="todo-badge-on-time">
          {formattedDate()}
        </span>
      )}
      
      {status() === 'completed_overdue' && (
        <span class="todo-badge-overdue" title="Completed late">
          ⚠️ OVERDUE
        </span>
      )}
    </div>
  );
}
