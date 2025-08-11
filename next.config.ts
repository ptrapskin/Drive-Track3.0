/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export (replaces the old `next export` command)
  output: 'export',

  // Safer routing for static hosting / webview bundles
  trailingSlash: true,

  // Skip type and lint errors during build (optional; remove if you want strict CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Next/Image tweaks for static export
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
