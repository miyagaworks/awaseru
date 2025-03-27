# アワセル デプロイ手順書

## 1. 事前確認
```bash
# デプロイユーザーの確認
whoami  # deployerであることを確認

# カレントディレクトリの確認
pwd  # /var/www/awaseru/current であることを確認
```

## 2. 既存プロセスの確認と停止

### 2.1 rootユーザーのプロセス確認・停止
```bash
# rootユーザーでの確認
sudo su
pm2 list
# プロセスがある場合は停止
pm2 kill  # （必要な場合のみ）
exit
```

### 2.2 deployerユーザーのプロセス確認・停止
```bash
# PM2プロセスの確認
pm2 list

# PM2プロセスの完全停止
pm2 kill
pm2 delete all

# 既存のポート使用確認
sudo lsof -i :3000
# プロセスが残っている場合は停止
sudo kill -9 [PID]  # （必要な場合のみ）
```

## 3. アプリケーション起動

### 3.1 PM2でのアプリケーション起動
```bash
# アプリケーションの起動
pm2 start npm --name "awaseru-app" -- start

# 状態確認
pm2 list
pm2 logs awaseru-app --lines 20  # ログの確認

# 設定の保存
pm2 save
```

## 4. 動作確認

### 4.1 プロセスの確認
```bash
# プロセスの状態確認
pm2 list  # statusが"online"であることを確認

# ポートの使用状況確認
sudo lsof -i :3000  # 単一のプロセスのみ存在することを確認
```

### 4.2 アプリケーションの確認
- ウェブブラウザでアクセスして動作確認
- エラーログの確認（必要に応じて）：
  ```bash
  pm2 logs awaseru-app
  ```

## 5. トラブルシューティング

問題が発生した場合は、以下の手順で対応：

1. ログの確認
   ```bash
   pm2 logs awaseru-app --lines 50
   ```

2. プロセスの再起動
   ```bash
   pm2 restart awaseru-app
   ```

3. 完全な再デプロイが必要な場合
   ```bash
   pm2 kill
   pm2 delete all
   pm2 start npm --name "awaseru-app" -- start
   pm2 save
   ```

## 6. 重要な注意点

- デプロイは必ずdeployerユーザーで実行
- rootユーザーのプロセスは完全に停止
- PM2の設定は必ずsaveコマンドで保存
- ポート3000の重複使用に注意
