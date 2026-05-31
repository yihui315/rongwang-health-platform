import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/solutions/sleep',
        destination: '/solutions/sleep-support',
        permanent: false,
      },
      {
        source: '/solutions/immune',
        destination: '/solutions/immune-support',
        permanent: false,
      },
      {
        source: '/solutions/fatigue',
        destination: '/solutions/men-health',
        permanent: false,
      },
      {
        source: '/assessment/sleep',
        destination: '/assessment/sleep-support',
        permanent: false,
      },
      {
        source: '/assessment/fatigue',
        destination: '/assessment/men-health',
        permanent: false,
      },
      {
        source: '/assessment/immune',
        destination: '/assessment/immune-support',
        permanent: false,
      },
      {
        source: '/assessment/female',
        destination: '/assessment/women-health',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
