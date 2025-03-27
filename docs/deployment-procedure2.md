# アワセル デプロイ手順書

## 0. 事前クリーンアップ（必要な場合）

```bash
# deployerユーザーで実行すること
# PM2プロセスの停止
pm2 delete awaseru-app

# /var/www/awaseruの完全クリーンアップ
cd /var/www/awaseru
sudo rm -rf *
sudo rm -rf .*

# 基本ディレクトリ構造の再作成
sudo mkdir -p /var/www/awaseru/current
sudo chown -R deployer:www-data /var/www/awaseru
sudo chmod -R 775 /var/www/awaseru

# /home/deployer/apps配下の確認と必要に応じてクリーンアップ
cd /home/deployer/apps/awaseru-app
rm -rf *
rm -rf .*
```

## 1. ビルドとパッケージ作成（ローカル環境）

```bash
# プロジェクトルートで実行
npm run build

# 必要なファイルをパッケージ化
tar -czf deploy.tar.gz \
  .next/ \
  public/ \
  package.json \
  .env.production
```

## 2. サーバーへの転送

```bash
# デプロイ用の一時ディレクトリ作成
cd /var/www/awaseru
mkdir -p temp_deploy
chown deployer:www-data temp_deploy
chmod 775 temp_deploy

# パッケージをサーバーに転送
scp deploy.tar.gz deployer@awaseru.net:/var/www/awaseru/temp_deploy/
```

## 3. デプロイ手順（サーバー環境）

### 3.1 準備

```bash
# 作業ディレクトリに移動
cd /var/www/awaseru/temp_deploy

# パッケージの展開
tar -xzf deploy.tar.gz

# 所有者とパーミッションの確認と修正
chown -R deployer:www-data .
chmod -R 775 .
```

### 3.2 ファイルの配置

```bash
# currentディレクトリが空であることを確認
ls -la /var/www/awaseru/current

# standaloneの内容をcurrentに配置
cp -r .next/standalone/* /var/www/awaseru/current/

# .nextディレクトリの構造を作成
mkdir -p /var/www/awaseru/current/.next/static
cp -r .next/static /var/www/awaseru/current/.next/

# publicディレクトリの構造を作成
mkdir -p /var/www/awaseru/current/public/icons
cp -r public/icons/* /var/www/awaseru/current/public/icons/

# 所有者とパーミッションの再確認
chown -R deployer:www-data /var/www/awaseru/current
chmod -R 775 /var/www/awaseru/current
```

### 3.3 PM2の設定

ecosystem.config.js を /var/www/awaseru/current に作成：
```javascript
module.exports = {
  apps: [{
    name: 'awaseru-app',
    script: 'server.js',
    cwd: '/var/www/awaseru/current',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 3.4 アプリケーションの起動

```bash
# 現在のディレクトリに移動
cd /var/www/awaseru/current

# 起動前の確認
ls -la
cat ecosystem.config.js

# PM2でアプリケーションを起動
pm2 start ecosystem.config.js

# 起動確認（エラーがないことを確認）
pm2 list
pm2 logs awaseru-app --lines 20
```

### 3.5 Nginx設定の確認

```bash
# Nginx設定の構文チェック
sudo nginx -t

# 問題なければNginxの再起動
sudo systemctl restart nginx
```

## 4. デプロイ後の確認事項

1. プロセス確認
   ```bash
   pm2 list
   # statusが"online"であることを確認
   ```

2. ログ確認
   ```bash
   pm2 logs awaseru-app --lines 50
   # エラーが出ていないことを確認
   ```

3. アクセス確認
   - ブラウザで https://awaseru.net/ にアクセス
   - 画面が正常に表示されることを確認
   - アイコンやスタイルが正しく表示されることを確認

4. クリーンアップ
   ```bash
   # 一時ファイルの削除
   cd /var/www/awaseru
   rm -rf temp_deploy
   ```

## 5. トラブルシューティング

エラーが発生した場合：

1. ログの確認
   ```bash
   pm2 logs awaseru-app
   sudo tail -f /var/log/nginx/error.log
   ```

2. プロセスの再起動
   ```bash
   cd /var/www/awaseru/current
   pm2 delete awaseru-app
   pm2 start ecosystem.config.js
   ```

3. パーミッションの確認
   ```bash
   ls -la /var/www/awaseru/current
   ls -la /var/www/awaseru/current/.next
   ls -la /var/www/awaseru/current/public
   ```

各ステップで必ず確認を行い、問題がないことを確認してから次のステップに進むこと。
