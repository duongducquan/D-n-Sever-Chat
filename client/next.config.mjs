/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Tránh duplicate socket connections khi dev
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
