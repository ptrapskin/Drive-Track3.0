
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Capacitor, we need a static export.
  output: 'export',

  // Skip type and lint errors during build (optional; remove if you want strict CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Next/Image remote patterns are still useful
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
