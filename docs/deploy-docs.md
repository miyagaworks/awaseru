# アワセル デプロイ手順書

## 1. 事前準備

### 1.1 環境変数の設定
`.env.production`に以下の環境変数が正しく設定されていることを確認：
```
NEXT_PUBLIC_SUPABASE_URL=https://plwevhhuqxyyuhchdezc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<実際のキー>
NEXT_PUBLIC_APP_URL=https://awaseru.net
NODE_ENV=production
```

### 1.2 Xサーバーの設定
1. Node.jsの有効化（バージョン: 18.x）
2. SSHアクセスの有効化
3. SSL証明書の確認

### 1.3 ローカル環境の準備
1. SSHキーの設定
2. `deploy.sh`の実行権限付与:
   ```bash
   chmod +x deploy.sh
   ```

## 2. ビルド・デプロイ手順

### 2.1 本番環境への反映
1. すべてのテストが通過していることを確認
   ```bash
   npm run test
   ```

2. 型チェックとリントを実行
   ```bash
   npm run check
   ```

3. デプロイスクリプトを実行
   ```bash
   ./deploy.sh
   ```

### 2.2 デプロイ後の確認
1. サイトの動作確認
   - https://awaseru.net にアクセス
   - メイン機能の確認
   - エラーページの確認

2. Supabaseの接続確認
   - データベース接続
   - 認証機能

### 2.3 問題発生時の対応
1. 前バージョンへの切り戻し
   ```bash
   # バックアップから復元
   ssh your-username@awaseru.net "cp -r /home/your-username/awaseru.net/public_html_backup_<timestamp> /home/your-username/awaseru.net/public_html"
   ```

2. ログの確認
   - Xサーバーのエラーログ
   - アプリケーションログ

## 3. メンテナンス

### 3.1 定期的な確認事項
- SSL証明書の有効期限
- Node.jsバージョン
- 依存パッケージの更新
- データベースのバックアップ

### 3.2 パフォーマンス監視
- ページ読み込み時間
- APIレスポンス時間
- データベースクエリのパフォーマンス
