/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: false,
  output: 'standalone',
  distDir: '.next',
};

module.exports = nextConfig;
