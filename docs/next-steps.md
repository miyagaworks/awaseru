# アワセル: 動的実装移行計画

## 1. 現状と進捗

### 1.1 環境構築状況
✅ Node.js環境の統一（v16.20.2）
- nvmによる管理を確立
- PATHの設定を最適化
- npm v8.19.4の動作確認済み
- GLIBCの制約により16系を採用

### 1.2 実行環境
- ホスティング: Xサーバー
- Webサーバ: Apache 2.4.x + Nginx
- プロジェクトパス: ~/awaseru.net/
- システムリソース:
  - メモリ: 193GB（十分）
  - プロセス制限: 2000（十分）
  - オープンファイル制限: 300000（十分）

### 1.3 実装状況
✅ Next.jsプロジェクトの初期化（v13.5.6）
✅ 基本設定の完了
✅ ビルド確認
✅ アプリケーション起動確認
✅ プロキシ設定の実装
- 起動URL:
  - アプリケーション: http://127.0.0.1:32768/app/
  - プロキシ経由: http://sv7122.xserver.jp/app/

## 2. Next.js設定

### 2.1 完了した作業
✅ ディレクトリ構造の整備
✅ 設定ファイルの作成と最適化
  - next.config.js
  - tailwind.config.ts
  - postcss.config.js
  - tsconfig.json
✅ 開発環境の構築
  - Node.js 16.20.2
  - npm 8.19.4
✅ ビルドプロセスの確認
✅ プロキシ設定の実装

### 2.2 設定ファイル状況
✅ next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/app',
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/app/:path*',
        destination: '/:path*',
      },
    ];
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
```

✅ プロキシ設定（~/public_html/app/.htaccess）
```apache
# Xサーバー環境用の.htaccess設定
RewriteEngine On

# HTTPSへのリダイレクト（必要な場合）
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# メインのプロキシルール
RewriteCond %{REQUEST_URI} ^/app/
RewriteRule ^app/(.*)$ http://127.0.0.1:32768/app/$1 [P,QSA,L]

# 静的ファイル用のプロキシルール
RewriteCond %{REQUEST_URI} ^/app/_next/
RewriteRule ^app/_next/(.*)$ http://127.0.0.1:32768/app/_next/$1 [P,QSA,L]

# mod_proxyの設定
ProxyPreserveHost On
ProxyRequests Off
```

### 2.3 解決した問題
1. Node.jsバージョンの選定
   - GLIBC互換性の問題により16.20.2を採用
   - 動作の安定性を確認

2. デプロイプロセスの確立
   - クリーンアップスクリプトの実装
   - プロセス管理の改善
   - ログ収集の整備

3. プロキシ設定の実装
   - .htaccessによるリバースプロキシの設定
   - 静的ファイルの適切な処理
   - ポート転送の設定

## 3. 実装状況

### 3.1 プロジェクト構造
```
~/awaseru.net/
├── .next/           # ビルド成果物
├── app/             # アプリケーションコード
├── node_modules/    # 依存関係
├── public/          # 静的ファイル
├── logs/           # アプリケーションログ
└── [設定ファイル群]

~/public_html/
└── app/
    └── .htaccess    # プロキシ設定
```

### 3.2 デプロイスクリプト
✅ start.sh
- プロセス管理
- 動的ポート割り当て（32768-60999）
- ログ管理
- エラーハンドリング

## 4. 次の作業予定

### 4.1 優先タスク
- [ ] 起動スクリプトの安定性向上
- [ ] エラーページの実装
- [ ] Supabase接続の実装
- [ ] ベースコンポーネントの移行
- [ ] ルーティングの実装
- [ ] APIエンドポイントの作成

### 4.2 確認事項
- [ ] プロキシ設定の動作確認
- [ ] セキュリティ設定の見直し
- [ ] パフォーマンスの最適化
- [ ] エラーハンドリングの強化
- [ ] バックアップ戦略の策定

## 5. 注意点

### 5.1 実行時の制約
- Node.js 16.20.2の使用が必須
- メモリ制限：256MB
- 使用可能ポート範囲：32768-60999
- プロキシパス: /app/

### 5.2 デプロイ手順
```bash
# 1. プロジェクトディレクトリに移動
cd ~/awaseru.net/

# 2. 依存関係の更新（必要な場合）
npm install

# 3. ビルド実行
npm run build

# 4. アプリケーション起動
./start.sh
```

### 5.3 監視項目
- プロセスの状態
- メモリ使用量
- ログの内容
- レスポンス時間
- プロキシ接続状態

### 5.4 バックアップ
- 本番コード: ~/awaseru.net.backup.1114/
- 設定ファイル: 個別にバックアップ
- データベース: 未実装

## 6. 今後の展望

### 6.1 短期目標
1. プロキシ設定の安定化
2. エラーページの実装
3. 基本機能の実装完了

### 6.2 中期目標
1. パフォーマンス最適化
2. セキュリティ強化
3. 監視体制の確立

### 6.3 技術的な検討事項
- Node.js 18へのアップグレード（GLIBC更新後）
- キャッシュ戦略の最適化
- CDNの活用検討