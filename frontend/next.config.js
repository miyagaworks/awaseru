/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // セキュリティのためX-Powered-Byヘッダーを削除
  compress: true, // レスポンス圧縮を有効化
  productionBrowserSourceMaps: false, // 本番環境でのソースマップを無効化
  // キャッシュの設定
  staticPageGenerationTimeout: 90,
};
