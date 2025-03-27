# アワセル マスターガイドライン

## 1. チャットコミュニケーション規則

## 1.1 基本原則

● 無駄なチャットを減らすため以下は厳守のこと!!
一つ一つの確認を確実に行う
相手の回答を待ってから次のステップを提案する
推測による複数の提案を避ける
明確な情報のみに基づいて対応する

## 1.2 コミュニケーションの流れ

現状の把握

提供された情報の正確な確認
不明点がある場合は、一つずつ質問
推測による判断を避ける


対応の提案

確認できた情報のみに基づく
一度に一つの対応策を提示
実行結果の確認を待つ


結果の確認

提案した対応の結果を確認
新たな問題が発生していないかの確認
次のステップの必要性を判断



## 1.3 チャットログ管理

重要な決定事項は即座に文書化
解決した問題は適切にタグ付けして記録
チャットの移行タイミングを計画的に管理

## 1.4 効率的なコミュニケーション

簡潔で明確な指示
一つずつ順序立てた確認
推測による提案を避ける
必要な情報が揃ってから次のステップへ

## 2. プロジェクト構成

### 2.1 ディレクトリ構造
```
~/Projects/awaseru-app/
├── __mocks__/
│   └── next/
│   │   └── navigation.ts
│   ├── lucide-react.ts
│   └── tailwind-merge.ts
├── public/
│   ├── icons/
│   │   ├── batsu.svg
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   ├── maru.svg
│   │   └── sankaku.svg
├── src/
│   ├── app/
│   │   └── [eventId]/
│   │   │   └── edit/
│   │   │   │   ├── ClientEventEditor.tsx
│   │   │   │   └── page.tsx
│   │   │   └── results/
│   │   │   │   ├── error.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── next.config.js
│   │   ├── page.tsx
│   ├── components/
│   │   ├── debug/
│   │   │   └── SupabaseDebug.tsx
│   │   ├── events/
│   │   │   ├── Calendar.tsx
│   │   │   ├── CreateButton.tsx
│   │   │   ├── DateSummary.tsx
│   │   │   ├── EventCreationForm.tsx
│   │   │   ├── EventEditor.tsx
│   │   │   ├── EventHeader.tsx
│   │   │   ├── ResponseGrid.tsx
│   │   │   └── ShareButton.tsx
│   │   ├── layout/
│   │   │   ├── Container.tsx
│   │   │   └── Header.tsx
│   │   ├── results/
│   │   │   └── ResultsContainer.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── ErrorAlert.tsx
│   │   │   ├── input.tsx
│   │   │   └── LoadingOverlay.tsx
│   │   └── DevelopmentLinks.tsx
│   ├── lib/
│   │   └── errors/
│   │   │   ├── errorHandler.test.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── errorMessages.ts
│   │   │   └── types.ts
│   │   └── hooks/
│   │   │   └── useErrorHandler.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       ├── database.ts
│       └── env.d.ts
└── tests/
    └── components/
    │   └── events/
    │   │   ├── Calendar.test.tsx
    │   │   ├── DateSummary.test.tsx
    │   │   ├── EventEditor.test.tsx
    │   │   └── ResponseGrid.test.tsx
    │   └── results/
    │       └── ResultsContainer.test.tsx
    └── e2e/
    │   └── edge-cases/
    │   │   └── ResultsContainer.edge.ts
    │   └── fixtures/
    │   │   └── eventData.ts
    │   └── mocks/
    │   │   └── handlers.ts
    │   └── performance/
    │   │   └── ResultsContainer.perf.ts
    │   └── results/
    │   │   └── ResultsContainer.spec.ts
    │   └── security/
    │   │   └── ResultsContainer.security.ts
    │   └── utils/
    │       ├── database.ts
    │       ├── setup.ts
    │       └── testHelpers.ts
    └── utils/
    │   └── test-utils.tsx
    ├── setup.ts
    └── tsconfig.json
├── .env.development
├── .env.local
├── .env.production
├── .eslintrc.json
├── deploy.sh
├── next.config.js
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## 2.2 開発環境設定

# 基本設定
npx create-next-app@latest awaseru-app --typescript --tailwind --app
cd awaseru-app
npm install dayjs @supabase/supabase-js

# アセット配置
mkdir -p public/app/icons
# logo.svg, maru.svg, batsu.svg, sankaku.svg, favicon.ico


## 3. デザイン仕様

### 3.1 カラーパレット
```typescript
export const colors = {
  white: '#ffffff',      // ヘッダー背景
  background: '#ececec', // アプリ背景
  gray: {
    text: '#939393',     // メニューアイコン、枠線
    light: '#f3f4f6',    // 表題背景
    muted: '#c4c4c4'     // 未回答
  },
  response: {
    ok: { bg: '#dcfce7', text: '#279600' },
    ng: { bg: '#fee2e2', text: '#d54040' },
    maybe: { bg: '#fff9c3', text: '#e5ca00' }
  },
  button: { edit: '#c0e0ff' },
  calendar: {
    sun: '#d54040',
    sat: '#00b0e9'
  }
}
```

### 3.2 レイアウト定義
- マージン: 20px（左右）
- コンポーネント間隔: 20px
- テーブル仕様:
  - 参加者列幅: 80px（固定）
  - 日付列幅: 110px
  - セル内パディング: 20px

### 3.3 タイポグラフィ
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans CJK JP', 'Arial', 'sans-serif']
      }
    }
  }
}
```

## 4. コンポーネント仕様

### 4.1 共通ルール
- 型定義は別ファイル必須
- Props型定義必須
- データフェッチはページレベル
- 状態管理はコンポーネント内完結

### 4.2 コアコンポーネント
```typescript
// Layout Components (components/layout/)
- Header: ヘッダーコンポーネント
  - ロゴ表示
  - ホームへのリンク
- Container: レイアウトコンテナ
  - 共通マージン設定
  - コンテンツのラッパー

// Event Components (components/events/)
- ResponseGrid: 回答グリッドコンポーネント
  - 日程と参加者の表示
  - 回答状態の管理
  - レスポンシブ対応
- EventEditor: イベント編集コンポーネント
  - 日程の追加/削除/編集（3ヶ月以内）
  - 参加者の追加/削除/編集（最大20名）
  - バリデーション機能
  
各コンポーネントの配置:
~/Projects/awaseru-app/
└── components/
    ├── layout/
    │   ├── Header.tsx      // ヘッダーコンポーネント
    │   └── Container.tsx   // コンテナコンポーネント
    └── events/
        ├── ResponseGrid.tsx // 回答グリッドコンポーネント
        └── EventEditor.tsx  // イベント編集コンポーネント
```

### 4.3 コンポーネント間の関係
- Container: 全てのページコンテンツのラッパー
- Header: 全ページ共通のヘッダー
- EventEditor: イベントの作成・編集機能
- ResponseGrid: イベントの回答表示・管理機能

### 4.4 イベント編集の制約
- 日程制限: 現在から3ヶ月以内
- 参加者制限: 最大20名まで
- 入力制限:
  - 参加者名: 最大20文字
  - 必須項目: 少なくとも1つの日程と1名の参加者


## 5. データ構造・アクセス

### 5.1 型定義
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  dates: string[];
  participants: string[];
  created_at: string;
  expires_at: string;
}

interface Response {
  event_id: string;
  participant_name: string;
  date: string;
  status: '未回答' | '◯' | '×' | '△';
  created_at: string;
}
```

### 5.2 データベース設定
```sql
create table events (
  id uuid primary key default uuid_v4(),
  title text not null,
  description text,
  dates date[] not null,
  participants text[] not null check (array_length(participants, 1) <= 20),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '3 months')
);

create table responses (
  id uuid primary key default uuid_v4(),
  event_id uuid references events(id),
  participant_name text not null,
  date date not null,
  status text not null check (status in ('未回答', '◯', '×', '△')),
  created_at timestamptz default now()
);
```

## 6. 開発規約

### 6.1 コーディング規則
- 
- インデント: 2スペース
- 最大行長: 80文字
- セミコロン必須
- any型禁止
- nullチェック必須
- 既存コードの修正・拡張時のルール：
  - 関連する既存ファイルの共有を必須とする
  - 既存の実装を尊重し、互換性を維持する
  - 既存のコード構造やパターンに従う

### 6.2 命名規則
- コンポーネント: PascalCase
- 関数・変数: camelCase
- 定数: UPPER_CASE
- ファイル: コンポーネントと同名

### 6.3 テスト要件
- レスポンシブ確認 (iPhone SE minimum)
- 機能テスト（入力、選択、回答、URL）
- エラー処理確認

### 6.4 コード共有・レビュープロセス
- 新規実装前の確認事項：
  1. 関連する既存ファイルの特定
  2. 既存ファイルの内容確認
  3. 影響範囲の分析
- 実装提案時の必須手順：
  1. 関連する既存ファイルを先に共有
  2. 既存実装との整合性の説明
  3. 変更による影響範囲の明示

## 7. 開発フロー

### 7.1 実装順序
1. 基本設定・環境構築
2. 共通コンポーネント実装
3. イベント作成機能
4. 回答機能
5. 結果表示機能
6. UI調整・テスト

### 7.2 制約事項
- 参加者上限: 20名
- データ保持: 3ヶ月
- 回答順序: 未回答 → ◯ → × → △
- モバイルファースト実装

## 8. ドキュメント管理

### 8.1 更新ルール
- 仕様変更は必ずドキュメント反映
- チャットログは日付・トピック記録
- 技術的決定は理由を記録

### 8.2 記録項目
- 仕様変更履歴
- 技術選定理由
- 問題解決手順
- テスト結果