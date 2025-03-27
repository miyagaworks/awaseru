// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Container } from "../components/layout/Container";
import "./globals.css";

export const metadata: Metadata = {
  title: "アワセル - シンプルな日程調整・スケジュール管理ツール",
  description: "アワセルは会議や打ち合わせの日程調整を簡単に行えるオンラインツールです。参加者の都合を一目で確認でき、URLを共有するだけで回答を集められます。登録不要で今すぐ無料でご利用いただけます。",
  metadataBase: new URL('https://awaseru.net'),
  icons: {
    icon: [
      { url: '/icons/favicon.ico' },
      { url: '/icons/pwa/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/pwa/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/pwa/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/pwa/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/pwa/apple-touch-icon.png' },
      { url: '/icons/pwa/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/pwa/apple-touch-icon-167x167.png', sizes: '167x167', type: 'image/png' },
      { url: '/icons/pwa/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'manifest',
        url: '/manifest.json',
      },
    ],
  },
  manifest: '/manifest.json',
  // viewportはここから削除
};

// 別の変数として定義
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-100 touch-manipulation">
        <Container>{children}</Container>
      </body>
    </html>
  );
}