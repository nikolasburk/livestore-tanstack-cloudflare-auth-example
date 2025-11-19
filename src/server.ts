// Import the default TanStack Start server entry
import { default as tanstackServerEntry } from '@tanstack/react-start/server-entry'
import * as SyncBackend from '@livestore/sync-cf/cf-worker'

// Import your Durable Object
import { SyncBackendDO } from '@/sync/client-ws'
import { createAuth } from '@/auth'

import type { CfTypes } from '@livestore/sync-cf/cf-worker'

// Export your Durable Objects so Cloudflare Workers can find it
export { SyncBackendDO }

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url)

      console.log('server.ts: fetch from: ', url.href)

    // Handle Better Auth routes
    if (url.pathname.startsWith('/api/auth/')) {
      const auth = createAuth(env, request.cf as IncomingRequestCfProperties)
      return auth.handler(request as unknown as Request)
    }

    const searchParams = SyncBackend.matchSyncRequest(request as unknown as CfTypes.Request)
    if (searchParams !== undefined) {
      console.log('server.ts: handleSyncRequest with searchParams', searchParams)
      return SyncBackend.handleSyncRequest({
        request: request as unknown as CfTypes.Request,
        searchParams,
        ctx: ctx as CfTypes.ExecutionContext,
        syncBackendBinding: 'SYNC_BACKEND_DO',
      })
    }

    return tanstackServerEntry.fetch(request)
  },
}



/** 
export default {
  async fetch(request: CfTypes.Request, env: Env, ctx: CfTypes.ExecutionContext) {
    const url = new URL(request.url)

    console.log('server.ts: fetch from: ', url)

    // Handle Better Auth routes
    if (url.pathname.startsWith('/api/auth/')) {
      const auth = createAuth(env, request.cf)
      return auth.handler(request as unknown as Request)
    }

    const searchParams = SyncBackend.matchSyncRequest(request)
    console.log('server.ts: fetch in  with searchParams', searchParams)
    if (searchParams !== undefined) {
      return SyncBackend.handleSyncRequest({
        request,
        searchParams,
        ctx,
        syncBackendBinding: 'SYNC_BACKEND_DO',
      })
    }

    return tanstackServerEntry.fetch(request as unknown as Request)
  },
}
*/