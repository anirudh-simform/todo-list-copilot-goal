import { createSignal, createEffect, onMount, For } from 'solid-js'

export default function App() {
  const [todos, setTodos] = createSignal([])
  const [text, setText] = createSignal('')
  const [filter, setFilter] = createSignal('all')
  const [theme, setTheme] = createSignal('light')

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
  })

  createEffect(() => {
    localStorage.setItem('solid-todos', JSON.stringify(todos()))
  })

  createEffect(() => {
    localStorage.setItem('solid-theme', theme())
    document.documentElement.setAttribute('data-theme', theme())
  })

  const addTodo = (e) => {
    e.preventDefault()
    const value = text().trim()
    if (!value) return
    setTodos([{ id: Date.now(), text: value, completed: false }, ...todos()])
    setText('')
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

  return (
    <div class="app-root">
      <header class="top">
        <h1 class="brand">TODO</h1>
        <button class="theme" onClick={toggleTheme} aria-label={theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          {theme() === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <section class="container">
        <form class="add" onSubmit={addTodo}>
          <input
            class="input"
            type="text"
            placeholder="What needs to be done?"
            value={text()}
            onInput={(e) => setText(e.target.value)}
            aria-label="New todo description"
          />
          <button class="btn" aria-label="Add new todo">Add</button>
        </form>

        <div class="card">
          <ul class="list">
            <For each={filtered()}>{(todo) => (
              <li classList={{ item: true, completed: todo.completed }}>
                <label class="left">
                  <input 
                    type="checkbox" 
                    checked={todo.completed} 
                    onChange={() => toggleTodo(todo.id)}
                    aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
                  />
                  <span class="text">{todo.text}</span>
                </label>
                <button 
                  class="del" 
                  onClick={() => removeTodo(todo.id)} 
                  aria-label={`Delete "${todo.text}"`}
                  type="button"
                >✕</button>
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
    </div>
  )
}
