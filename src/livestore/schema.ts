import { Events, makeSchema, Schema, State, SessionIdSymbol } from '@livestore/livestore'

export const Filter = Schema.Literal('All', 'Active', 'Completed')
export type Filter = typeof Filter.Type

export const tables = {
  todos: State.SQLite.table({
    name: 'todos',
    columns: {
      id: State.SQLite.integer({ primaryKey: true }),
      text: State.SQLite.text({ default: '' }),
      completed: State.SQLite.boolean({ default: false }),

    },
  }),
  uiState: State.SQLite.clientDocument({
    name: 'uiState',
    schema: Schema.Struct({ input: Schema.String, filter: Filter }),
    default: { id: SessionIdSymbol, value: { input: '', filter: 'All' } },
  }),
}

export const events = {
  todoCreated: Events.synced({
    name: 'v1.TodoCreated',
    schema: Schema.Struct({ id: Schema.Number, text: Schema.String }),
  }),
  todoDeleted: Events.synced({
    name: 'v1.TodoDeleted',
    schema: Schema.Struct({ id: Schema.Number }),
  }),
  todoCompleted: Events.synced({
    name: 'v1.TodoCompleted',
    schema: Schema.Struct({ id: Schema.Number }),
  }),
  todoUncompleted: Events.synced({
    name: 'v1.TodoUncompleted',
    schema: Schema.Struct({ id: Schema.Number }),
  }),
  uiStateSet: tables.uiState.set,

}

const materializers = State.SQLite.materializers(events, {
  'v1.TodoCreated': ({ id, text }) => tables.todos.insert({ id, text }),
  'v1.TodoDeleted': ({ id }) => tables.todos.delete().where({ id: id }),
  'v1.TodoCompleted': ({ id }) => tables.todos.update({ completed: true }).where({ id }),
  'v1.TodoUncompleted': ({ id }) => tables.todos.update({ completed: false }).where({ id }),
})

const state = State.SQLite.makeState({ tables, materializers })
export const schema = makeSchema({ events, state })