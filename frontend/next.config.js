/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    compress: true,
    productionBrowserSourceMaps: false,
    staticPageGenerationTimeout: 90,
    // experimental部分を修正
    experimental: {
        // appDirを削除
        serverActions: true,
    },
};

module.exports = nextConfig;