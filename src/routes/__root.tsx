import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'

import appCss from '@/styles.css?url'

import { makePersistedAdapter } from '@livestore/adapter-web'
import { LiveStoreProvider } from '@livestore/react'
import { schema } from '@/livestore/schema.ts'
import LiveStoreWorker from '@/livestore/livestore.worker.ts?worker'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'
import authClient from '@/lib/authClient.ts'

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
  const [storeId, setStoreId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initStore = async () => {
      try {
        const session = await authClient.getSession()
        const userId = session?.data?.session?.userId || session?.data?.user?.id

        if (userId) {
          // Set per-user storeId
          setStoreId(`livestore-todo-app-v3-user-${userId}`)
        } else {
          // For unauthenticated users, use a temporary storeId
          // This allows the app to render, but routes will redirect to login
          setStoreId('livestore-todo-app-v2-guest')
        }
      } catch (error) {
        console.error('Failed to initialize store:', error)
        // Fallback to guest storeId on error
        setStoreId('guest')
      } finally {
        setIsLoading(false)
      }
    }
    initStore()
  }, [location.pathname, location.search])

  // Show loading state while determining storeId
  if (isLoading) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
          <Scripts />
        </body>
      </html>
    )
  }

  // Only render LiveStoreProvider when we have a storeId
  if (!storeId) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Unable to initialize store</p>
          </div>
          <Scripts />
        </body>
      </html>
    )
  }

  console.log('RENDER RootDocument: storeId', storeId)
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
          storeId={storeId}
          batchUpdates={batchUpdates}
        >
          <Header />
          {children}
          {/* <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          /> */}
        </LiveStoreProvider>
        <Scripts />
      </body>
    </html>
  )
}
