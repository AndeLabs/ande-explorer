/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'ANDE Explorer',
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },

  // Image optimization
  images: {
    domains: ['explorer.ande.chain', 'explorer-advanced.ande.chain'],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },

  // Rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/blockscout/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_HOST}/:path*`,
      },
    ];
  },

  // Optimize build
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  experimental: {
    // optimizeCss: true, // Disabled - causes critters module error
  },

  // Ignore TypeScript and ESLint errors during build
  typescript: {
    // Dangerously allow production builds to complete even if there are type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to complete even if there are ESLint errors
    ignoreDuringBuilds: true,
  },

  // Production optimizations for Vercel
  compress: true,
  poweredByHeader: false,

  // Output configuration for optimal Vercel deployment
  // output: 'standalone', // Not needed for Vercel

  // Optimize bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },

  // Force webpack to resolve path aliases
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib/config': require('path').resolve(__dirname, 'lib/config'),
      '@/lib/api': require('path').resolve(__dirname, 'lib/api'),
      '@/lib/hooks': require('path').resolve(__dirname, 'lib/hooks'),
      '@/lib/utils': require('path').resolve(__dirname, 'lib/utils'),
      '@/lib': require('path').resolve(__dirname, 'lib'),
      '@/components': require('path').resolve(__dirname, 'components'),
      '@/app': require('path').resolve(__dirname, 'app'),
      '@/styles': require('path').resolve(__dirname, 'styles'),
      '@': __dirname,
    };
    return config;
  },
};

module.exports = nextConfig;
