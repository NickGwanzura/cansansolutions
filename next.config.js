/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  reactStrictMode: false,
  distDir: '.next',
  output: 'standalone',
};

module.exports = nextConfig;
