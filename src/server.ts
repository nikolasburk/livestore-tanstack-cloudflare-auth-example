// Import the default TanStack Start server entry
import { default as tanstackServerEntry } from '@tanstack/react-start/server-entry'
import * as SyncBackend from '@livestore/sync-cf/cf-worker'

// Import your Durable Object
import { SyncBackendDO } from './sync/client-ws'

import type { CfTypes } from '@livestore/sync-cf/cf-worker'

// Export your Durable Objects so Cloudflare Workers can find it
export { SyncBackendDO }

export default {
  async fetch(request: CfTypes.Request, _env: SyncBackend.Env, ctx: CfTypes.ExecutionContext) {

    console.log('client-ws.ts: fetch in ', request.url)
    const searchParams = SyncBackend.matchSyncRequest(request)
    console.log('client-ws.ts: fetch in  with searchParams', searchParams)
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