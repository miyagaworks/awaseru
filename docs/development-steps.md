# アワセル開発ステップ

## 1. イベント作成機能の実装 (/create)
```typescript
// app/create/page.tsx（この部分を必ず挿入する）
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventOperations } from '@/lib/supabase';

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        title: 'テストイベント',
        description: 'テスト用のイベントです',
        dates: ['2024-11-10', '2024-11-11', '2024-11-12'],
        participants: ['テスト参加者1', 'テスト参加者2']
      };

      const event = await eventOperations.createEvent(eventData);
      router.push(`/${event.id}/results`);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">イベントの作成</h1>
      
      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? '作成中...' : 'テストイベントを作成'}
      </button>
    </div>
  );
}
```

## 2. 開発用リンクの修正
```typescript
// app/page.tsx の開発用リンク部分
{process.env.NODE_ENV === 'development' && (
  <div className="mt-12 p-4 bg-gray-100 rounded-lg">
    <h2 className="text-lg font-bold mb-2">開発用リンク</h2>
    <Link 
      href="/create"
      className="text-blue-600 hover:underline block"
    >
      テストイベントを作成
    </Link>
  </div>
)}
```

## 3. テスト手順

### 基本フロー
1. `npm run dev` で開発サーバー起動
2. http://localhost:3000/ にアクセス
3. 「テストイベントを作成」で /create ページへ
4. イベント作成を実行
5. 作成されたイベントページで動作確認

### 確認項目
1. イベント作成の成功
2. イベントページへの遷移
3. データの表示
4. レスポンス機能
5. リアルタイム更新

## 4. エラーハンドリング
- データベース接続エラー
- データ不存在
- バリデーションエラー
- ネットワークエラー

## 5. 開発環境の整備
1. Supabase接続確認
2. テーブル構造の確認
3. 環境変数の設定
4. 権限設定の確認
