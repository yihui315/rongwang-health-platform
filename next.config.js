/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署需要 standalone 输出
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.minimaxi.com',
      },
      {
        protocol: 'https',
        hostname: '*.minimaxi.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
  },
  poweredByHeader: false,
  compress: true,
  // 环境变量透传到客户端
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://rongwang.health',
  },
};

module.exports = nextConfig;
