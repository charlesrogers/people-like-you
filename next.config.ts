import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "imprevista",
  project: "people-like-you",
  silent: true, // don't print Sentry logs during build
  disableLogger: true,
});
