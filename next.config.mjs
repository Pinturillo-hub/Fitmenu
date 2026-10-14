/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Fitmenu',
  assetPrefix: '/Fitmenu/',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
