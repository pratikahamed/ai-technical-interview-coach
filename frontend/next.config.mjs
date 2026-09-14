/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  devIndicators: false,
};

export default nextConfig;
