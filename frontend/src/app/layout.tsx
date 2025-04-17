// src/app/layout.tsx
import type { Metadata } from "next";
// Viewport型のインポートを削除
import { Container } from "../components/layout/Container";
import "./globals.css";

export const metadata: Metadata = {
  title: "アワセル - シンプルな日程調整・スケジュール管理ツール",
  description:
    "アワセルは会議や打ち合わせの日程調整を簡単に行えるオンラインツールです。参加者の都合を一目で確認でき、URLを共有するだけで回答を集められます。登録不要で今すぐ無料でご利用いただけます。",
  metadataBase: new URL("https://awaseru.net"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://awaseru.net",
    title: "アワセル - シンプルな日程調整・スケジュール管理ツール",
    description: "簡単・スマートな日程調整サービス。登録不要ですぐに使えます。",
    siteName: "アワセル",
    images: [
      {
        url: "https://awaseru.vercel.app/images/ogp.jpg", // 画像のパスを指定
        width: 1000,
        height: 525,
        alt: "アワセル - シンプルな日程調整・スケジュール管理ツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "アワセル - シンプルな日程調整・スケジュール管理ツール",
    description: "簡単・スマートな日程調整サービス。登録不要ですぐに使えます。",
    images: ["https://awaseru.vercel.app/images/ogp.jpg"],
  },
  // LINE専用のメタタグを追加
  other: {
    "line:image": "https://awaseru.vercel.app/images/line-ogp.png", // LINE用の画像
    "line:title": "アワセル - シンプルな日程調整ツール", // LINE用のタイトル
    "line:description": "簡単・スマートな日程調整サービス", // LINE用の説明
  },
  icons: {
    icon: "/app/favicon.ico",
    shortcut: "/app/favicon.ico",
    apple: "/icons/pwa/apple-touch-icon.png",
    other: [
      {
        rel: "apple-touch-icon",
        url: "/icons/pwa/apple-touch-icon.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "152x152",
        url: "/icons/pwa/apple-touch-icon-152x152.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "167x167",
        url: "/icons/pwa/apple-touch-icon-167x167.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        url: "/icons/pwa/apple-touch-icon-180x180.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/icons/pwa/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/icons/pwa/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        url: "/icons/pwa/favicon-48x48.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "96x96",
        url: "/icons/pwa/favicon-96x96.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/icons/pwa/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/icons/pwa/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/manifest.json",
};


// 型なしで定義
export const viewport = {
  width: "device-width",
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