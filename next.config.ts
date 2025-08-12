/** @type {import('next').NextConfig} */
const nextConfig = {
  // Switched from 'export' to 'standalone' for App Hosting compatibility
  output: 'standalone',

  // Skip type and lint errors during build (optional; remove if you want strict CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Next/Image remote patterns are still useful
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
