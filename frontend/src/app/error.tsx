// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録
    console.error('Global error:', error);
  }, [error]);

  const getErrorMessage = (error: Error): string => {
    // エラーの種類に応じたメッセージをカスタマイズ
    if (error.message.includes('fetch')) {
      return 'データの取得に失敗しました';
    }
    if (error.message.includes('validation')) {
      return '入力内容に問題があります';
    }
    if (error.message.includes('permission')) {
      return 'アクセス権限がありません';
    }
    return 'エラーが発生しました';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h1 className="text-lg font-medium text-red-900">
              {getErrorMessage(error)}
            </h1>
          </div>
          
          <p className="text-sm text-red-600 mb-4">
            申し訳ありません。予期せぬエラーが発生しました。
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => reset()}
              variant="default"
              className="w-full"
            >
              再試行
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              トップに戻る
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}