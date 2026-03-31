import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions for performance
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
  environment: process.env.NODE_ENV,
});
