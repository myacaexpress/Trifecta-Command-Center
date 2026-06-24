import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native/WASM and SDK packages out of the bundler so they load at runtime.
  serverExternalPackages: [
    "@electric-sql/pglite",
    "@neondatabase/serverless",
    "@anthropic-ai/sdk",
  ],
};

export default nextConfig;
