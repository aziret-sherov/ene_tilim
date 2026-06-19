import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.ene-tilim.online' }],
        destination: 'https://ene-tilim.online/:path*',
        permanent: true,
      },
      {
        source: '/akya',
        destination: '/jomoktor',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
};

export default nextConfig;
