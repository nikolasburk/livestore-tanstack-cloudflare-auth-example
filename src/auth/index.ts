import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

// Single auth configuration that handles both CLI and runtime scenarios
function createAuth(env?: Env, cf?: IncomingRequestCfProperties) {

  // console.log('createAuth with env', env);
  // console.log('createAuth with IncomingRequestCfProperties', cf);

  // Use actual DB for runtime, empty object for CLI
  const db = env ? drizzle(env.auth_db, { schema, logger: false }) : ({} as any);

  return betterAuth({
    baseURL: env?.BETTER_AUTH_URL,
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: env
          ? {
            db,
            options: {
              usePlural: true,
              debugLogs: false,
            },
          }
          : undefined,
        // kv: env?.KV,
      },
      {
        emailAndPassword: {
          enabled: true,
        },
        rateLimit: {
          enabled: true,
          window: 60, // Minimum KV TTL is 60s
          max: 100, // reqs/window
          customRules: {
            // https://github.com/better-auth/better-auth/issues/5452
            "/sign-in/email": {
              window: 60,
              max: 100,
            },
            "/sign-in/social": {
              window: 60,
              max: 100,
            },
          },
        },
      }
    ),
    // Only add database adapter for CLI schema generation
    ...(env
      ? {}
      : {
        database: drizzleAdapter({} as D1Database, {
          provider: "sqlite",
          usePlural: true,
          debugLogs: false,
        }),
      }),
  });
}

// Export for CLI schema generation
export const auth = createAuth();

// Export for runtime usage
export { createAuth };