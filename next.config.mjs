/** @type {import('next').NextConfig} */
const nextConfig = {
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
                pathname: "/images/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3001",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "imagedelivery.net",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "customer-6lygbkywiu1pj547.cloudflarestream.com",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "d2cou4uug2ehe9.cloudfront.net",
                pathname: "/**"
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                pathname: "/**"
            },
        ],
    },
};

export default nextConfig;
