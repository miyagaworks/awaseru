/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  experimental: {
  },
  // 依存関係を含める設定を追加
  experimental: {
    outputFileTracingRoot: process.cwd(),
    outputFileTracingIncludes: {
      '/**/*': ['node_modules/**/*']
    }
  }
};

module.exports = nextConfig;