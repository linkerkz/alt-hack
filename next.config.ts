import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["echarts", "zrender"],
  // Шрифты PDF читаются с диска (lib/pdf.ts) — трассировка их не видит.
  outputFileTracingIncludes: {
    "/dashboard/*/incidents/*/pdf": ["./lib/fonts/*.woff"],
  },
};

export default nextConfig;
