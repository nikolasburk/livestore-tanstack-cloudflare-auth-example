import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import appCss from '../styles.css?url'

import { makePersistedAdapter } from '@livestore/adapter-web'
import { LiveStoreProvider } from '@livestore/react'
import { schema } from '../livestore/schema.ts'
import LiveStoreWorker from '../livestore/livestore.worker.ts?worker'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'

const adapter = makePersistedAdapter({
  storage: { type: 'opfs' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'LiveStore Todo Auth Example',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <LiveStoreProvider
          schema={schema}
          adapter={adapter}
          renderLoading={(_) => <div>Loading LiveStore ({_.stage})...</div>}
          storeId="todo-auth-tutorial-v2"
          batchUpdates={batchUpdates}
        >
          <Header />
          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </LiveStoreProvider>
        <Scripts />
      </body>
    </html>
  )
}
