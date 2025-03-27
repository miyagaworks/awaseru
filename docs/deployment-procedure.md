# アワセル デプロイ手順書

## 1. ビルドとパッケージ作成（ローカル環境）

```bash
# プロジェクトルートで実行
npm run build

# 1. パッケージを作成（node_modulesを含む）
tar -czf deploy.tar.gz \
  .next/ \
  public/ \
  package.json \
  .env.production \
  node_modules/

# サイズの確認
ls -lh deploy.tar.gz

## 2. サーバーへの転送

### サーバー側
```bash
# デプロイユーザーに変更
su - deployer
```

```bash
# サーバー側でtemp_deployフォルダを作成しておく
mkdir -p /var/www/awaseru/temp_deploy/
```

```bash
# パッケージをサーバーに転送
scp deploy.tar.gz deployer@162.43.21.137:/var/www/awaseru/temp_deploy/
```


## 3. デプロイ手順（サーバー環境）

### 3.1 準備

```bash
# 作業ディレクトリに移動
cd /var/www/awaseru/temp_deploy

# パッケージの展開
tar -xzf deploy.tar.gz
```

### 3.2 ファイルの配置

```bash
# standaloneの内容をcurrentに配置
cp -r .next/standalone/* /var/www/awaseru/current/

# 静的ファイルの配置
cp -r .next/static /var/www/awaseru/current/.next/

# .nextディレクトリの内容をコピー
cp -r .next/* /var/www/awaseru/current/.next/

# publicディレクトリのアイコンをコピー
cp -r public/icons/* /var/www/awaseru/current/public/icons/
```

### 3.3 PM2の設定

ecosystem.config.js の内容：
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

# PM2でアプリケーションを起動
pm2 start ecosystem.config.js

# 起動確認
pm2 list
pm2 logs awaseru --lines 20
```

### 3.5 Nginx設定の確認と再起動

```bash
# Nginx設定の構文チェック
nginx -t

# Nginxの再起動
systemctl restart nginx
```

## 4. デプロイ後の確認事項

1. アプリケーションの起動確認
   - PM2のプロセスステータス
   - エラーログの確認

2. アクセス確認
   - https://awaseru.net/ へのアクセス
   - アイコンやスタイルの表示確認

3. クリーンアップ
   ```bash
   cd /var/www/awaseru
   rm -rf temp_deploy
   ```

## 5. ロールバック手順

問題が発生した場合は、以下の手順でロールバックを実施：

```bash
# 1. バックアップから復元
cd /var/www/awaseru
rm -rf current
cp -r backup_[TIMESTAMP] current

# 2. PM2の再起動
cd current
pm2 restart awaseru
```

## 6. 注意事項

- デプロイ前に必ずローカルでビルドが成功することを確認
- 本番環境の.env.productionファイルの内容を確認
- バックアップは最低3世代は保持する
- PM2のログで致命的なエラーがないことを確認
