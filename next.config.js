/** @type {import('next').NextConfig} */
const nextConfig = {
    // 本番環境でのソースマップを無効化
    productionBrowserSourceMaps: false,

    // ESLintのチェックを無効にする
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;