const path = require('path');

// Safe optional local .env loader (Vercel provides process.env natively)
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch {
  // On Vercel, environment variables are provided natively via process.env
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@shaktiq/shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    NEXTAUTH_SECRET:
      process.env.NEXTAUTH_SECRET ||
      'shaktiq-nextauth-super-secret-production-and-development-key-32-chars-long!',
    MONGODB_URI:
      process.env.MONGODB_URI ||
      'mongodb://shaktiq_admin:admin2026@ac-oept6kq-shard-00-00.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-01.dyzf282.mongodb.net:27017,ac-oept6kq-shard-00-02.dyzf282.mongodb.net:27017/shaktiIQ?ssl=true&replicaSet=atlas-jlnvw8-shard-0&authSource=admin&retryWrites=true&w=majority',
    MONGODB_DB: process.env.MONGODB_DB || 'shaktiIQ',
    MONGODB_DB_NAME: process.env.MONGODB_DB || 'shaktiIQ',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const apiTarget = process.env.API_BACKEND_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiTarget}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
