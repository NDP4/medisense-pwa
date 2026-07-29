import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // API route configuration
  experimental: {
    // Allow larger request bodies for sync data
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Static asset configuration
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
