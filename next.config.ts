
/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Firebase App Hosting, we need a standalone server build.
  output: 'standalone',

  // Skip type and lint errors during build (optional; remove if you want strict CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
