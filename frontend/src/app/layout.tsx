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
  icons: {
    // 既存のアイコン設定を維持
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