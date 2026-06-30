import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/api/v1/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.100",
        port: "5000",
        pathname: "/api/v1/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(process.cwd());
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/v1/auth/:path*`,
      },
      {
        source: "/api/v1/admin/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/v1/admin/:path*`,
      },
      {
        source: "/api/v1/auctions/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/v1/auctions/:path*`,
      },
    ];
  },
};

export default nextConfig;
