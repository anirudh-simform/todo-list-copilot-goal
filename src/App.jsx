import { createSignal, createEffect, onMount, For, Show } from 'solid-js'
import logo from './logo.svg'
import { formatTime, getDeadlineStatus } from './utils/time'
import SettingsPanel from './components/SettingsPanel'
import TimePicker from './components/TimePicker'

export default function App() {
  const [todos, setTodos] = createSignal([])
  const [text, setText] = createSignal('')
  const [filter, setFilter] = createSignal('all')
  const [theme, setTheme] = createSignal('light')
  const [timeFormat, setTimeFormat] = createSignal('12')
  const [showSettings, setShowSettings] = createSignal(false)
  const [showDeadlineInput, setShowDeadlineInput] = createSignal(false)
  const [deadline, setDeadline] = createSignal(null)
  const [editingDeadlineId, setEditingDeadlineId] = createSignal(null)
  const [editingDeadlineValue, setEditingDeadlineValue] = createSignal(null)

  onMount(() => {
    const saved = localStorage.getItem('solid-todos')
    if (saved) {
      try {
        setTodos(JSON.parse(saved))
      } catch (e) {}
    }
    const savedTheme = localStorage.getItem('solid-theme')
    if (savedTheme) setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme || 'light')
    
    const savedTimeFormat = localStorage.getItem('solid-timeFormat')
    if (savedTimeFormat) setTimeFormat(savedTimeFormat)
  })

  createEffect(() => {
    localStorage.setItem('solid-todos', JSON.stringify(todos()))
  })

  createEffect(() => {
    localStorage.setItem('solid-theme', theme())
    document.documentElement.setAttribute('data-theme', theme())
  })

  createEffect(() => {
    localStorage.setItem('solid-timeFormat', timeFormat())
  })

  const addTodo = (e) => {
    e.preventDefault()
    const value = text().trim()
    if (!value) return
    setTodos([{ id: Date.now(), text: value, completed: false, deadline: deadline() }, ...todos()])
    setText('')
    setDeadline(null)
    setShowDeadlineInput(false)
  }

  const toggleTodo = (id) => {
    setTodos(todos().map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const removeTodo = (id) => setTodos(todos().filter((t) => t.id !== id))

  const clearCompleted = () => setTodos(todos().filter((t) => !t.completed))

  const remaining = () => todos().filter((t) => !t.completed).length

  const filtered = () => {
    if (filter() === 'active') return todos().filter((t) => !t.completed)
    if (filter() === 'completed') return todos().filter((t) => t.completed)
    return todos()
  }

  const toggleTheme = () => setTheme(theme() === 'light' ? 'dark' : 'light')

  const toggleSettings = () => setShowSettings(!showSettings())

  const handleTimeFormatChange = (format) => {
    setTimeFormat(format)
  }

  const startEditingDeadline = (todo) => {
    setEditingDeadlineId(todo.id)
    setEditingDeadlineValue(todo.deadline)
  }

  const saveDeadline = (todoId) => {
    if (editingDeadlineId() === todoId) {
      setTodos(todos().map((t) =>
        t.id === todoId ? { ...t, deadline: editingDeadlineValue() } : t
      ))
      setEditingDeadlineId(null)
      setEditingDeadlineValue(null)
    }
  }

  const cancelEditingDeadline = () => {
    setEditingDeadlineId(null)
    setEditingDeadlineValue(null)
  }

  const removeDeadline = (todoId) => {
    setTodos(todos().map((t) =>
      t.id === todoId ? { ...t, deadline: null } : t
    ))
    setEditingDeadlineId(null)
    setEditingDeadlineValue(null)
  }

  return (
    <div class="app-root">
      <header class="top">
        <div class="brand-container">
          <img src={logo} alt="Focus Task Tracker Logo" class="brand-logo" />
          <h1 class="brand">FOCUS</h1>
        </div>
        <div class="header-controls">
          <button class="settings-btn" onClick={toggleSettings} aria-label="Open settings">
            ⚙️
          </button>
          <button class="theme" onClick={toggleTheme} aria-label={theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme() === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <section class="container">
        <form class="add" onSubmit={addTodo}>
          <div class="add-form-main">
            <input
              class="input"
              type="text"
              placeholder="What needs to be done?"
              value={text()}
              onInput={(e) => setText(e.target.value)}
              aria-label="New todo description"
            />
            <button class="btn" aria-label="Add new todo">Add</button>
            <button
              class="btn-deadline-toggle"
              onClick={() => setShowDeadlineInput(!showDeadlineInput())}
              type="button"
              aria-label="Add deadline"
              title="Add a deadline time for this todo"
            >
              ⏰
            </button>
          </div>

          <Show when={showDeadlineInput()}>
            <div class="deadline-input-section">
              <label class="deadline-section-label">Set Deadline</label>
              <TimePicker
                id="add-todo-deadline"
                initialTime={deadline() || '09:00'}
                onChange={setDeadline}
                ariaLabelledby="deadline-section-label"
              />
              <div class="deadline-input-actions">
                <button
                  class="btn btn-sm"
                  type="button"
                  onClick={() => setShowDeadlineInput(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Show>
        </form>

        <div class="card">
          <ul class="list">
            <For each={filtered()}>{(todo) => (
              <li classList={{ item: true, completed: todo.completed, 'has-deadline': !!todo.deadline }}>
                <label class="left">
                  <input 
                    type="checkbox" 
                    checked={todo.completed} 
                    onChange={() => toggleTodo(todo.id)}
                    aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                  />
                  <span class="text">{todo.text}</span>
                </label>

                <Show when={!editingDeadlineId() || editingDeadlineId() !== todo.id}>
                  <div class="right-content">
                    <Show when={todo.deadline && editingDeadlineId() !== todo.id}>
                      <div
                        class={`deadline-badge deadline-status-${getDeadlineStatus(todo.deadline)}`}
                        onClick={() => startEditingDeadline(todo)}
                        role="button"
                        tabindex="0"
                        aria-label={`Deadline: ${formatTime(todo.deadline, timeFormat())}. Click to edit.`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            startEditingDeadline(todo)
                          }
                        }}
                      >
                        <span class="deadline-time">{formatTime(todo.deadline, timeFormat())}</span>
                        <span class="deadline-status-label">
                          {getDeadlineStatus(todo.deadline) === 'overdue' && 'Overdue'}
                          {getDeadlineStatus(todo.deadline) === 'soon' && 'Soon'}
                          {getDeadlineStatus(todo.deadline) === 'upcoming' && 'Upcoming'}
                        </span>
                      </div>
                    </Show>

                    <Show when={!todo.deadline && editingDeadlineId() !== todo.id}>
                      <button
                        class="btn-add-deadline"
                        onClick={() => startEditingDeadline({ ...todo, deadline: '09:00' })}
                        aria-label="Add deadline"
                        title="Add a deadline"
                        type="button"
                      >
                        ⏰
                      </button>
                    </Show>

                    <button 
                      class="del" 
                      onClick={() => removeTodo(todo.id)} 
                      aria-label={`Delete "${todo.text}"`}
                      type="button"
                    >✕</button>
                  </div>
                </Show>

                <Show when={editingDeadlineId() === todo.id}>
                  <div class="deadline-editor">
                    <TimePicker
                      id={`deadline-edit-${todo.id}`}
                      initialTime={editingDeadlineValue() || '09:00'}
                      onChange={setEditingDeadlineValue}
                      ariaLabelledby={`deadline-edit-label-${todo.id}`}
                    />
                    <div class="deadline-editor-actions">
                      <button
                        class="btn btn-sm"
                        onClick={() => saveDeadline(todo.id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        class="btn btn-sm"
                        onClick={() => removeDeadline(todo.id)}
                        type="button"
                        title="Remove deadline"
                      >
                        Remove
                      </button>
                      <button
                        class="btn btn-sm"
                        onClick={cancelEditingDeadline}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Show>
              </li>
            )}</For>
          </ul>

          <footer class="foot">
            <span class="count" role="status" aria-live="polite">{remaining()} item{remaining() === 1 ? '' : 's'} left</span>
            <div class="filters" role="group" aria-label="Filter todos">
              <button 
                classList={{ active: filter() === 'all' }} 
                onClick={() => setFilter('all')}
                aria-pressed={filter() === 'all'}
                aria-label="Show all todos"
              >All</button>
              <button 
                classList={{ active: filter() === 'active' }} 
                onClick={() => setFilter('active')}
                aria-pressed={filter() === 'active'}
                aria-label="Show active todos"
              >Active</button>
              <button 
                classList={{ active: filter() === 'completed' }} 
                onClick={() => setFilter('completed')}
                aria-pressed={filter() === 'completed'}
                aria-label="Show completed todos"
              >Completed</button>
            </div>
            <button class="clear" onClick={clearCompleted} type="button">Clear completed</button>
          </footer>
        </div>
      </section>

      <footer class="note">Brutalist todo app with modern design.</footer>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        timeFormat={timeFormat}
        onTimeFormatChange={handleTimeFormatChange}
      />
    </div>
  )
}
