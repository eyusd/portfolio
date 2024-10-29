import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      }
    ]
  }
}
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig)
