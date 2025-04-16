# アワセル Vercel+Supabase移行計画書

## 1. 概要

アワセルアプリケーションをXサーバーVPSからVercelプラットフォームに移行し、バックエンドとしてSupabaseを活用する包括的な計画書です。この移行により、Next.jsアプリケーションのデプロイとホスティングの問題を解決し、より安定したサービス提供を実現します。

### 現状の課題
- XサーバーVPSでのNext.js設定（output: standalone）に関する問題
- シンボリックリンクの循環参照エラー
- Nginx設定とポート番号の不一致
- デプロイプロセスの複雑さ

### 移行のメリット
- Next.js公式サポート企業によるホスティング (Vercel)
- サーバーレスバックエンド (Supabase)
- 自動的なCI/CDパイプライン
- グローバルCDNを介した高速配信
- ゼロ構成によるSSR/SSGのサポート
- プレビュー環境の自動生成

## 2. 移行準備

### 2.1 リポジトリの準備

1. **GitHubリポジトリの整理**
    - 既存のリポジトリをクリーンな状態にする
    - 必要なファイルだけを残す
    ```
    awaseru-net/
    ├── frontend/          # Vercelにデプロイするフロントエンド
    │   ├── src/
    │   ├── public/
    │   ├── package.json
    │   ├── next.config.js
    │   └── ...
    └── docs/              # ドキュメント
        └── ...
    ```

2. **Supabase関連ファイルの準備**
    - `frontend/src/lib/supabase.ts` ファイルの作成/更新
    - 環境変数の設定例を `.env.example` に追加

### 2.2 Supabase環境のセットアップ

1. **Supabaseプロジェクト作成**
    - [Supabase](https://supabase.com)でアカウント作成（まだ持っていない場合）
    - 新規プロジェクトの作成
    - リージョンは東京（または最も近いロケーション）を選択

2. **データベーススキーマの設定**
    ```sql
    -- events テーブル
    create table events (
      id uuid primary key default uuid_v4(),
      title text not null,
      description text,
      dates date[] not null,
      participants text[] not null check (array_length(participants, 1) <= 20),
      created_at timestamptz default now(),
      expires_at timestamptz default (now() + interval '3 months')
    );

    -- responses テーブル
    create table responses (
      id uuid primary key default uuid_v4(),
      event_id uuid references events(id),
      participant_name text not null,
      date date not null,
      status text not null check (status in ('未回答', '◯', '×', '△')),
      created_at timestamptz default now()
    );
    ```

3. **APIキーとURLの取得**
    - プロジェクト設定からAPI URLを取得
    - anon public APIキーを取得（安全なパブリックAPIアクセス用）

### 2.3 必要なファイルの調整

1. **frontend/src/lib/supabase.ts**
    ```typescript
    import { createClient } from '@supabase/supabase-js';
    import type { Database, FormattedResponses, ResponseStatus } from '@/types/database';

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    export const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false }
      }
    );

    export const eventOperations = {
      // イベントの存在確認
      async checkEventExists(eventId: string): Promise<boolean> {
        try {
          const { data, error } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .maybeSingle();

          if (error) throw error;
          return !!data;
        } catch (error) {
          console.error('Error in checkEventExists:', error);
          throw error;
        }
      },

      // イベントの取得
      async getEvent(eventId: string) {
        try {
          const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

          if (error) throw error;
          return event;
        } catch (error) {
          console.error('Error in getEvent:', error);
          throw error;
        }
      },

      // イベントの作成
      async createEvent(data: {
        title?: string;
        description: string | null;
        dates: string[];
        participants: string[];
      }) {
        try {
          const { data: event, error } = await supabase
            .from('events')
            .insert({
              title: data.title || '日程調整',
              description: data.description,
              dates: data.dates,
              participants: data.participants,
            })
            .select()
            .single();

          if (error) throw error;
          if (!event) {
            throw new Error('イベントの作成に失敗しました');
          }

          return event;
        } catch (error) {
          console.error('Error in createEvent:', error);
          throw error;
        }
      },

      // イベントの更新
      async updateEvent(id: string, data: Partial<{
        description: string | null;
        dates: string[];
        participants: string[];
      }>) {
        const { error } = await supabase
          .from('events')
          .update(data)
          .eq('id', id);

        if (error) {
          console.error('Error updating event:', error);
          throw error;
        }
      },

      // レスポンス更新
      async updateResponse(data: {
        event_id: string;
        participant_name: string;
        date: string;
        status: ResponseStatus;
      }) {
        try {
          const { data: response, error } = await supabase
            .from('responses')
            .upsert({
              event_id: data.event_id,
              participant_name: data.participant_name,
              date: data.date,
              status: data.status
            })
            .select()
            .single();

          if (error) {
            console.error('Error updating response:', error);
            throw error;
          }

          return response;
        } catch (error) {
          console.error('Error in updateResponse:', error);
          throw error;
        }
      },

      // 複数レスポンス更新
      async updateResponses(
        eventId: string,
        responses: Array<{
          event_id: string;
          participant_name: string;
          date: string;
          status: ResponseStatus;
        }>
      ) {
        const { data, error } = await supabase
          .from('responses')
          .upsert(responses)
          .select();

        if (error) {
          throw error;
        }
        return data;
      },

      // レスポンス取得
      async getResponses(eventId: string) {
        const { data, error } = await supabase
          .from('responses')
          .select('*')
          .eq('event_id', eventId);

        if (error) {
          console.error('Error fetching responses:', error);
          throw error;
        }
        return data || [];
      },

      // レスポンスのフォーマット
      formatResponses(responses: Array<{
        participant_name: string;
        date: string;
        status: ResponseStatus;
      }>): FormattedResponses {
        const formatted: FormattedResponses = {};

        responses.forEach(response => {
          // 参加者ごとのオブジェクトがなければ作成
          if (!formatted[response.participant_name]) {
            formatted[response.participant_name] = {};
          }

          // 日付ごとのステータスを設定
          formatted[response.participant_name][response.date] = response.status;
        });

        return formatted;
      },

      // 初期レスポンスの生成
      generateInitialResponses(eventId: string, participants: string[], dates: string[]): Array<{
        event_id: string;
        participant_name: string;
        date: string;
        status: ResponseStatus;
      }> {
        return dates.flatMap(date =>
          participants.map(participant => ({
            event_id: eventId,
            participant_name: participant,
            date: date,
            status: '未回答'
          }))
        );
      },

      // イベントと回答の一括取得
      async getEventWithResponses(eventId: string) {
        try {
          const [eventResult, responsesResult] = await Promise.all([
            supabase
              .from('events')
              .select('*')
              .eq('id', eventId)
              .single(),
            supabase
              .from('responses')
              .select('*')
              .eq('event_id', eventId)
          ]);

          if (eventResult.error) throw eventResult.error;
          if (responsesResult.error) throw responsesResult.error;

          const event = eventResult.data;
          const responses = this.formatResponses(responsesResult.data || []);

          return {
            event,
            responses
          };
        } catch (error) {
          console.error('Error in getEventWithResponses:', error);
          throw error;
        }
      }
    };

    export type { ResponseStatus, FormattedResponses };
    ```

2. **frontend/next.config.js**
    ```javascript
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      // Vercelでは不要なので削除またはコメントアウト
      // output: 'standalone',
      
      // 本番環境でのソースマップを無効化
      productionBrowserSourceMaps: false,
    }
    
    module.exports = nextConfig
    ```

3. **frontend/.env.example**
    ```
    # Supabase環境変数
    NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
    ```

4. **frontend/package.json の依存関係確認**
    ```json
    "dependencies": {
      "@supabase/supabase-js": "^2.46.1"
      // その他の既存の依存関係...
    }
    ```

## 3. Vercelへのデプロイ準備

### 3.1 Vercelアカウント設定

1. [Vercel](https://vercel.com)にログイン/アカウント作成
2. GitHubアカウントとの連携
3. プロジェクト作成：「Import Git Repository」からリポジトリを選択

### 3.2 プロジェクト設定

1. **フレームワークプリセット**
   - Next.jsを自動検出（手動で選択することも可能）

2. **ビルド設定**
   - ルートディレクトリ：`frontend` 
   - ビルドコマンド：`npm run build`（デフォルト）
   - 出力ディレクトリ：`.next`（デフォルト）

3. **環境変数の設定**
   - `NEXT_PUBLIC_SUPABASE_URL`：Supabaseプロジェクトのパブリックな接続URL 
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabaseプロジェクトのパブリックなanonキー

## 4. デプロイと検証

### 4.1 デプロイの実行

1. Vercelダッシュボードで「Deploy」ボタンをクリック 
2. デプロイログを確認
3. エラーがあれば修正してコードをプッシュし、再デプロイ

### 4.2 デプロイ後の確認

1. 自動生成されたURLでアプリケーションが正常に動作するか確認
2. Supabase APIとの接続が正常か確認
3. コンソールでエラーがないか確認
4. レスポンシブデザインが意図通りに動作するか確認

## 5. 本番環境への切り替え

### 5.1 カスタムドメイン設定

1. Vercelダッシュボードで「Domains」タブを選択
2. 「Add」をクリックし、`awaseru.net`を入力
3. DNSレコードの設定：
   - Aレコード：`76.76.21.21`を設定
   - または、指定されたVercelのドメインにCNAMEレコードを設定

4. SSL証明書は自動的に生成・更新される

### 5.2 DNS伝播の待機

1. DNSの伝播には最大48時間かかる場合がある
2. [dnschecker.org](https://dnschecker.org/)などのツールで伝播状況を確認
3. Vercelダッシュボードで「Valid Configuration」のステータスを確認

## 6. データ移行（必要な場合）

### 6.1 既存データをSupabaseへ移行

1. 既存のデータをCSVファイルとしてエクスポート
2. Supabase Studio経由でインポート
   - または、Node.jsスクリプトを使ってデータ移行を自動化

## 7. 運用と保守

### 7.1 定期的なメンテナンス

1. 月次のパッケージ更新
2. セキュリティ更新の適用
3. デプロイメントのモニタリングレビュー

### 7.2 バックアップ戦略

1. GitHubリポジトリはコードのバックアップとして機能
2. Supabaseのデータベーススナップショットを定期的に作成
3. Vercelのデプロイメント履歴で以前のバージョンに戻すことが可能

### 7.3 トラブルシューティング

1. Vercelダッシュボードでビルドログを確認
2. Supabase Studioでデータベースクエリとログを確認
3. 問題発生時の緊急ロールバック手順の確立

## 8. 移行スケジュール

| フェーズ | タスク | 期間 | 担当者 |
|---------|-------|------|--------|
| 準備 | リポジトリ整理とコード調整 | 1日 | 開発チーム |
| Supabase設定 | データベーススキーマ設定と接続テスト | 半日 | バックエンド担当 |
| Vercelデプロイ | フロントエンド初期デプロイ | 半日 | フロントエンド担当 |
| テスト | 機能テストと連携確認 | 1日 | QAチーム |
| DNS設定 | カスタムドメイン移行 | 1-2日（伝播待ち） | インフラ担当 |
| モニタリング | 本番環境の安定性確認 | 2日 | 開発・運用チーム |

## 9. ロールバック計画

万が一の場合に備え、以下のロールバック計画を用意します：

1. **DNS設定の復元**：
   - `awaseru.net`のDNSレコードをXサーバーVPSのIPアドレスに戻す

2. **バックアップからの復元**：
   - VPS上の最新バックアップを使用して復元
   - または、Supabaseからエクスポートしたデータを既存のデータベースに復元

3. **切り替え判断基準**：
   - 重大なユーザー体験の低下が24時間以上続く場合
   - データ整合性に関わる問題が発生した場合
   - セキュリティインシデントが発生した場合

## 10. リソースと参考資料

- [Vercel Next.js デプロイドキュメント](https://vercel.com/docs/frameworks/nextjs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [カスタムドメイン設定ガイド](https://vercel.com/docs/projects/domains/add-a-domain)
- [Supabase JavaScript クライアントAPI](https://supabase.com/docs/reference/javascript/introduction)
- [Vercel 環境変数とシークレットの管理](https://vercel.com/docs/projects/environment-variables)
