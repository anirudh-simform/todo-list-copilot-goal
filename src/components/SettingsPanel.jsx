import { Show } from 'solid-js'

/**
 * SettingsPanel Component
 * Modal overlay for global settings including time format preference
 */
export default function SettingsPanel(props) {
  const handleTimeFormatChange = (format) => {
    props.onTimeFormatChange(format)
  }

  const handleClose = () => {
    props.onClose()
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  return (
    <Show when={props.isOpen()}>
      <div 
        class="settings-backdrop" 
        onClick={handleBackdropClick}
        role="presentation"
      >
        <div 
          class="settings-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          onKeyDown={handleKeyDown}
        >
          <div class="settings-header">
            <h2 id="settings-title" class="settings-title">Settings</h2>
            <button
              class="settings-close"
              onClick={handleClose}
              aria-label="Close settings"
              type="button"
            >
              ✕
            </button>
          </div>

          <div class="settings-content">
            <div class="settings-group">
              <label id="time-format-label" class="settings-label">Time Format</label>
              <fieldset class="time-format-group" aria-labelledby="time-format-label">
                <legend class="sr-only">Choose time format</legend>
                
                <label class="radio-label">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="12"
                    checked={props.timeFormat() === '12'}
                    onChange={() => handleTimeFormatChange('12')}
                    aria-label="12-hour format (e.g., 2:30 PM)"
                  />
                  <span class="radio-text">12-hour (2:30 PM)</span>
                </label>

                <label class="radio-label">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="24"
                    checked={props.timeFormat() === '24'}
                    onChange={() => handleTimeFormatChange('24')}
                    aria-label="24-hour format (e.g., 14:30)"
                  />
                  <span class="radio-text">24-hour (14:30)</span>
                </label>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
