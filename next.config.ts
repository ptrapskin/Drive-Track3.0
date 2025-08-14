/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use 'export' for static export compatible with Capacitor
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Skip type and lint errors during build (optional; remove if you want strict CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Trailing slash for consistent routing
  trailingSlash: true,
};

module.exports = nextConfig;
