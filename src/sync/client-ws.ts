import { makeDurableObject } from '@livestore/sync-cf/cf-worker'

export class SyncBackendDO extends makeDurableObject({
  onPush: async (message, context) => {
    console.log('client-ws.ts: onPush', message, context)
  },
  onPull: async (message, context) => {
    console.log('client-ws.ts: onPull', message, context)
  },
}) { }
