import { createSignal } from 'solid-js';

/**
 * DatePicker Component
 * 
 * Native HTML5 date input for selecting future dates
 * Returns ISO 8601 date string (day-only, midnight UTC)
 * 
 * Props:
 * - value?: string | Date - Current selected date (ISO 8601 or Date object)
 * - onChange: (date: Date) => void - Callback when date selected
 * - minDate?: string | Date - Minimum selectable date (default: today)
 * - disabled?: boolean - Whether picker is disabled
 * - label?: string - Form label (default: "Schedule Date")
 */
export default function DatePicker(props) {
  const [value, setValue] = createSignal(
    props.value instanceof Date 
      ? props.value.toISOString().split('T')[0]
      : props.value || ''
  );

  const minDate = props.minDate instanceof Date
    ? props.minDate.toISOString().split('T')[0]
    : props.minDate || new Date().toISOString().split('T')[0];

  const handleChange = (e) => {
    const dateString = e.target.value;
    setValue(dateString);
    
    if (dateString) {
      // Convert to Date object for callback
      const date = new Date(dateString + 'T00:00:00Z');
      props.onChange?.(date);
    }
  };

  return (
    <div class="date-picker-container">
      {props.label && <label class="date-picker-label">{props.label}</label>}
      <input
        type="date"
        class="date-picker-input"
        value={value()}
        onChange={handleChange}
        min={minDate}
        disabled={props.disabled}
        aria-label={props.label || 'Schedule Date'}
      />
    </div>
  );
}
