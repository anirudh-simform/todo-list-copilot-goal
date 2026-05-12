import { createSignal, createEffect } from 'solid-js'

/**
 * TimePicker Component
 * Custom time picker with hour/minute spinners
 * Stores time internally in 24-hour format (HH:MM)
 * Displays based on provided format (12 or 24)
 */
export default function TimePicker(props) {
  // Initialize from provided time or use current time
  const initialTime = props.initialTime || '00:00'
  const [hours, setHours] = createSignal(parseInt(initialTime.split(':')[0], 10))
  const [minutes, setMinutes] = createSignal(parseInt(initialTime.split(':')[1], 10))

  // Sync time to parent when changed
  createEffect(() => {
    const time24 = `${String(hours()).padStart(2, '0')}:${String(minutes()).padStart(2, '0')}`
    if (props.onChange) {
      props.onChange(time24)
    }
  })

  // Increment/decrement functions
  const incrementHours = () => {
    setHours((h) => (h + 1) % 24)
  }

  const decrementHours = () => {
    setHours((h) => (h - 1 + 24) % 24)
  }

  const incrementMinutes = () => {
    setMinutes((m) => (m + 1) % 60)
  }

  const decrementMinutes = () => {
    setMinutes((m) => (m - 1 + 60) % 60)
  }

  // Keyboard handlers
  const handleHoursKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault()
        incrementHours()
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault()
        decrementHours()
        break
      default:
        break
    }
  }

  const handleMinutesKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault()
        incrementMinutes()
        break
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault()
        decrementMinutes()
        break
      default:
        break
    }
  }

  // Direct input handlers
  const handleHoursInput = (e) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 0 && value < 24) {
      setHours(value)
    }
  }

  const handleMinutesInput = (e) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 0 && value < 60) {
      setMinutes(value)
    }
  }

  return (
    <div class="time-picker" role="group" aria-labelledby={props.ariaLabelledby}>
      <div class="time-picker-inputs">
        {/* Hours */}
        <div class="time-input-group">
          <label for={`hours-${props.id}`} class="time-input-label">
            Hours
          </label>
          <div class="time-spinner">
            <button
              class="spinner-btn spinner-up"
              onClick={incrementHours}
              aria-label="Increase hours"
              type="button"
              tabindex={props.tabIndex ?? 0}
            >
              ▲
            </button>
            <input
              id={`hours-${props.id}`}
              class="time-input"
              type="number"
              min="0"
              max="23"
              value={String(hours()).padStart(2, '0')}
              onChange={handleHoursInput}
              onKeyDown={handleHoursKeyDown}
              aria-label="Hours (0-23)"
              aria-valuenow={hours()}
              aria-valuemin="0"
              aria-valuemax="23"
            />
            <button
              class="spinner-btn spinner-down"
              onClick={decrementHours}
              aria-label="Decrease hours"
              type="button"
            >
              ▼
            </button>
          </div>
        </div>

        <div class="time-separator">:</div>

        {/* Minutes */}
        <div class="time-input-group">
          <label for={`minutes-${props.id}`} class="time-input-label">
            Minutes
          </label>
          <div class="time-spinner">
            <button
              class="spinner-btn spinner-up"
              onClick={incrementMinutes}
              aria-label="Increase minutes"
              type="button"
            >
              ▲
            </button>
            <input
              id={`minutes-${props.id}`}
              class="time-input"
              type="number"
              min="0"
              max="59"
              value={String(minutes()).padStart(2, '0')}
              onChange={handleMinutesInput}
              onKeyDown={handleMinutesKeyDown}
              aria-label="Minutes (0-59)"
              aria-valuenow={minutes()}
              aria-valuemin="0"
              aria-valuemax="59"
            />
            <button
              class="spinner-btn spinner-down"
              onClick={decrementMinutes}
              aria-label="Decrease minutes"
              type="button"
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
