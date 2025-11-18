import { createFileRoute, redirect } from '@tanstack/react-router'

import { useStore } from '@livestore/react'
import { tables, events, Filter } from '../livestore/schema'
import { queryDb } from '@livestore/livestore'
import authClient from '../lib/authClient'


export const Route = createFileRoute('/')({
  component: App,
  ssr: false,
  beforeLoad: async () => {
    // Check if user is authenticated
    const session = await authClient.getSession()
    console.log('index.tsx: beforeLoad with session', session)
    if (!session?.data?.session) {
      throw redirect({
        to: '/login',
      })
    }
  },
})

function App() {

  const { store } = useStore()


  const uiState$ = queryDb(() => tables.uiState.get())
  const { input, filter } = store.useQuery(uiState$)

  const todos$ = queryDb((
    (get) => {
      const { filter } = get(uiState$)
      return tables.todos.where({
        completed: filter === 'Completed' ? true
          : filter === 'Active' ? false
            : undefined
      })
    }
  ), { label: 'todos' })
  const todos = store.useQuery(todos$)
  
  const updatedInput = (input: string) => store.commit(events.uiStateSet({ input }))
  const updatedFilter = (filter: Filter) => store.commit(events.uiStateSet({ filter }))

  const addTodo = () => {
    if (input.trim()) {
      store.commit(
        events.todoCreated({ id: Date.now(), text: input }),
      )
      updatedInput('')
    }
  }

  const deleteTodo = (id: number) => {
    store.commit(
      events.todoDeleted({ id }),
    )
  }

  const toggleTodo = (id: number, completed: boolean) => {
    store.commit(
      completed ? events.todoUncompleted({ id }) : events.todoCompleted({ id })
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="text-5xl font-bold text-gray-800 text-center mb-12">
          Todo List
        </h1>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => updatedInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a todo..."
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addTodo}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex gap-1 mb-4 border-b border-gray-200 justify-center">
          {(['All', 'Active', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => updatedFilter(tab)}
              className={`px-5 py-2.5 text-sm bg-transparent border-0 -mb-px cursor-pointer outline-none transition-colors ${filter === tab
                  ? 'text-blue-500 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {todos.map(todo => (
            <div
            key={todo.id}
            className="flex items-center justify-between bg-white px-4 py-3 rounded shadow-sm"
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className={`text-gray-700 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="px-4 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Delete
            </button>
          </div>
          ))}
        </div>

        {todos.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            No todos yet. Add one above!
          </p>
        )}
      </div>
    </div>
  )
}