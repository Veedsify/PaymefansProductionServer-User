import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
    // Enable tree shaking for better bundle optimization
    esmExternals: true,
  },
  // Move server external packages to the correct location
  serverExternalPackages: ["hls.js", "socket.io-client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**",
      },
      {
        protocol: "https",
        hostname: "videos.pexels.com",
        pathname: "/video-files/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3009",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "customer-6lygbkywiu1pj547.cloudflarestream.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d2389neb6gppcb.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dafftcpbr/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.paymefans.shop",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
