// src/components/layout/Container.tsx
'use client';

import { ReactNode } from 'react';
import { Header } from './Header';

interface ContainerProps {
  children: ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <Header />
      
      {/* メインコンテンツ */}
      <main className="flex-grow bg-custom-bg mt-[60px]">
        <div className="max-w-[1200px] mx-auto px-5 py-8">
          {children}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-custom-bg border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto px-5 py-5 text-center text-sm text-gray-500">
          <span>©awaseru</span>
        </div>
      </footer>
    </div>
  );
};