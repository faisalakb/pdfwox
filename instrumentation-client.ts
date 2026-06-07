/**
 * Client error tracking — runs after HTML loads, before React hydration.
 *
 * Silent no-op when NEXT_PUBLIC_SENTRY_DSN is unset (PR forks, local dev).
 * Real DSN goes into a GitHub secret + Vercel env var when ready.
 */
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
