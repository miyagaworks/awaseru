// src/app/page.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-12">
      {/* ヒーローセクション */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 md:p-12 lg:p-16 shadow-xl">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        {/* 背景SVGの修正部分 */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            preserveAspectRatio="xMaxYMax slice"
            className="absolute top-0 right-0 opacity-20"
          >
            <path
              fill="currentColor"
              d="M40,120 C20,140 20,160 40,180 C60,200 80,200 100,180 C120,160 140,160 160,180 C180,200 180,160 180,140 C180,120 160,100 140,100 C120,100 120,80 140,60 C160,40 160,20 140,0 C120,-20 100,0 80,20 C60,40 40,40 20,20 C0,0 0,40 0,60 C0,80 20,100 40,120 Z"
            ></path>
          </svg>
        </div>
        <div className="relative z-10 max-w-2xl w-full flex flex-col items-center md:items-start">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-slide-up text-center md:text-left">
            さ、調整しよ！
          </h1>
          <p
            className="text-lg md:text-xl text-blue-100 mb-8 animate-slide-up text-center md:text-left w-full"
            style={{ animationDelay: "0.1s" }}
          >
            簡単・スマートな日程調整サービス。 登録不要ですぐに使えます。
          </p>
          <Link
            href="/create"
            className="inline-flex items-center px-6 py-4 rounded-lg text-lg font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl animate-slide-up self-center md:self-start"
            style={{ animationDelay: "0.2s" }}
          >
            <Calendar className="mr-2 h-5 w-5" />
            日程を調整する
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            シンプルな3ステップ
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            誰でも簡単に使える日程調整ツール
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            className="card p-6 space-y-4 card-hover animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800">
              日程を選択
            </h3>
            <p className="text-gray-600 text-center">
              調整したい日程をカレンダーから選びます
            </p>
          </div>
          <div
            className="card p-6 space-y-4 card-hover animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800">
              参加者を追加
            </h3>
            <p className="text-gray-600 text-center">
              参加者の名前を入力して追加します
            </p>
          </div>
          <div
            className="card p-6 space-y-4 card-hover animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800">
              回答を共有
            </h3>
            <p className="text-gray-600 text-center">
              URLを共有して参加者に回答してもらいます
            </p>
          </div>
        </div>
      </div>
      {/* メリットセクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">アワセルの特徴</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">登録不要</h3>
                <p className="text-gray-600">
                  アカウント登録なしですぐに使い始められます
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  リアルタイム更新
                </h3>
                <p className="text-gray-600">
                  回答状況がリアルタイムで反映されます
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  シンプル設計
                </h3>
                <p className="text-gray-600">
                  直感的なUI設計で誰でも簡単に使えます
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/images/dashboard-preview.png"
            alt="アワセルの使用例"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
      {/* CTAセクション */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">今すぐ始めましょう</h2>
        <p className="text-blue-100 max-w-2xl mx-auto mb-8">
          登録不要、完全無料でご利用いただけます。
          チームやグループの日程調整をスムーズに行いましょう。
        </p>
        <Link
          href="/create"
          className="inline-flex items-center px-6 py-3 rounded-lg text-lg font-bold bg-white text-blue-600 hover:bg-blue-50 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
        >
          日程を調整する
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}