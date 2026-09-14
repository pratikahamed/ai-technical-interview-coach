import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
};

export default nextConfig;
