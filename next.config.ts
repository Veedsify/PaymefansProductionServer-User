import type { NextConfig } from "next";

const nextConfig: NextConfig = {

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
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3009",
        pathname: "/**",
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
        hostname: "randomuser.me",
        pathname: "/**",
      }
    ],
  },
}

export default nextConfig;