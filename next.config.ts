import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /* Enables standalone output for Docker/server deploy: .next/standalone + .next/static */
  output: 'standalone',
  /* Set typescript.ignoreBuildErrors and eslint.ignoreDuringBuilds to false for strict production builds */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
