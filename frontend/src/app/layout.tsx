// src/app/layout.tsx
import type { Metadata } from "next";
import { Container } from "../components/layout/Container";
import "./globals.css";

export const metadata: Metadata = {
  title: "アワセル - シンプルな日程調整・スケジュール管理ツール",
  description:
    "アワセルは会議や打ち合わせの日程調整を簡単に行えるオンラインツールです。参加者の都合を一目で確認でき、URLを共有するだけで回答を集められます。登録不要で今すぐ無料でご利用いただけます。",
  metadataBase: new URL("https://awaseru.net"),
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://awaseru.net",
    title: "アワセル - シンプルな日程調整・スケジュール管理ツール",
    description: "簡単・スマートな日程調整サービス。登録不要ですぐに使えます。",
    siteName: "アワセル",
    images: [
      {
        url: "https://awaseru.vercel.app/images/ogp.jpg", // 後でawaseru.netに変更
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
  other: {
    "line:image": "https://awaseru.vercel.app/images/line-ogp.png", // 後でawaseru.netに変更
    "line:title": "アワセル - シンプルな日程調整ツール",
    "line:description": "簡単・スマートな日程調整サービス",
  },
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