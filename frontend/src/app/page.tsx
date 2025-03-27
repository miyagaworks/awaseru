// src/app/page.tsx
'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* メインセクション */}
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold">
          さ、調整しよ！
        </h1>
        <p className="text-x text-gray-600">
          簡単に日程調整ができるサービスです。
        </p>
        <div className="pt-4">
          <Link
            href="/create"
            className="inline-block bg-[#3B82F6] text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-600 transition-colors"
          >
            日程を調整する
          </Link>
        </div>
      </div>

      {/* 使い方セクション */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center">使い方</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-600">1</span>
            </div>
            <h3 className="text-lg font-bold text-center">日程を選択</h3>
            <p className="text-gray-600 text-center">
              調整したい日程を<br />カレンダーから選びます
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-600">2</span>
            </div>
            <h3 className="text-lg font-bold text-center">参加者を追加</h3>
            <p className="text-gray-600 text-center">
              参加者の名前を<br />入力して追加します
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-blue-600">3</span>
            </div>
            <h3 className="text-lg font-bold text-center">回答を共有</h3>
            <p className="text-gray-600 text-center">
              URLを共有して<br />参加者に回答してもらいます
            </p>
          </div>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center">特徴</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">登録不要</h3>
              <p className="text-gray-600">
                アカウント登録なしで<br />すぐに使い始められます
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">リアルタイム更新</h3>
              <p className="text-gray-600">
                回答状況がリアルタイムで<br />反映されます
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}