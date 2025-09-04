# アワセル VPS 初期セットアップガイド

## 1. SSH接続設定

### 1.1 SSH接続情報
```
ホスト: x162-43-21-137.static.xvps.ne.jp
ポート: 22（デフォルト）
ユーザー: root（初期接続用）
秘密鍵: ~/.ssh/awaseru_new
```

### 1.2 基本的な接続手順
```bash
# 秘密鍵のパーミッション設定
chmod 600 ~/.ssh/awaseru_new

# SSH接続
ssh -i ~/.ssh/awaseru_new root@x162-43-21-137.static.xvps.ne.jp

# 初回接続時やサーバー再構築時のホストキー変更対応
ssh-keygen -R x162-43-21-137.static.xvps.ne.jp
```

## 2. 初期セキュリティ設定

### 2.1 システムアップデート
```bash
# システムの完全アップデート
apt update
apt upgrade -y

# アップデート後は再起動が推奨
reboot
```

### 2.2 システムユーザーの作成
```bash
# デプロイ用ユーザーの作成
adduser deployer
# パスワードの設定
# - 12文字以上
# - 大文字、小文字、数字、特殊記号を含める
# ユーザー情報は Enter で省略可能

# sudo グループに追加
usermod -aG sudo deployer

# SSHディレクトリの作成
mkdir -p /home/deployer/.ssh
cp /root/.ssh/authorized_keys /home/deployer/.ssh/
chown -R deployer:deployer /home/deployer/.ssh
chmod 700 /home/deployer/.ssh
chmod 600 /home/deployer/.ssh/authorized_keys
```

### 2.3 SSHセキュリティ設定
```bash
# SSHの設定ファイルをバックアップ
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# SSHの設定変更
nano /etc/ssh/sshd_config

# 以下の設定を確認または追加
PermitRootLogin yes        # 初期セットアップ時は yes のまま
PasswordAuthentication yes # 初期セットアップ時は yes のまま
PubkeyAuthentication yes
AllowUsers root deployer   # rootとdeployerの両方を許可

# SSHサービスの再起動
systemctl restart ssh

# deployer ユーザーでの接続テスト（別ターミナルで実行）
ssh -i ~/.ssh/awaseru_new root@x162-43-21-137.static.xvps.ne.jp
```

### 2.4 ファイアウォール設定
```bash
# UFWのインストールと基本設定
apt install -y ufw

# 基本ルールの設定
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https

# ファイアウォールの有効化
ufw enable

# 設定の確認
ufw status
```

## 3. 基本パッケージのインストール
```bash
# 必要なパッケージのインストール
apt install -y \
    curl \
    git \
    build-essential \
    nginx \
    certbot \
    python3-certbot-nginx
```

## 4. Node.js環境のセットアップ

### 4.1 Node.jsのインストール
```bash
# Node.js 20.xのインストール
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# バージョン確認
node --version  # v20.18.0
npm --version   # 10.8.2

# npm更新とグローバルパッケージのインストール
npm install -g npm@latest
npm install -g pm2
```

## 5. 重要な注意事項

### 5.1 SSH設定の注意点
- 初期セットアップ時は、root と deployer の両方のアクセスを許可
- デプロイ用ユーザーでの接続確認が取れてから制限を強化
- 設定変更前には必ずバックアップを作成

### 5.2 セットアップ時の確認項目
1. システムアップデート後の再起動
2. deployer ユーザーでのSSH接続確認
3. ファイアウォールの状態確認
4. Node.jsとnpmのバージョン確認

### 5.3 トラブルシューティング
- SSHホストキーの変更時は `ssh-keygen -R ホスト名` で対応
- 接続できない場合は、別セッションを保持したまま設定変更を実施
- 設定変更後は必ず接続テストを実施


## 6. Nginx初期設定

### 6.1 基本設定
```bash
# デフォルト設定の削除
rm /etc/nginx/sites-enabled/default

# アワセル用の設定ファイル作成
nano /etc/nginx/sites-available/awaseru
```

```nginx
# /etc/nginx/sites-available/awaseru
server {
    listen 80;
    server_name awaseru.net;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# シンボリックリンクの作成
ln -s /etc/nginx/sites-available/awaseru /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 7. アプリケーションのデプロイ設定

### 7.1 PM2の設定
```bash
# /var/www/awaseru/current ディレクトリで設定ファイル作成
nano ecosystem.config.js

# 設定内容
module.exports = {
  apps: [{
    name: 'awaseru',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/awaseru/current',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'cluster',
    max_memory_restart: '512M'
  }]
};

# PM2起動と永続化設定
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# 表示されたコマンドをsudoで実行
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deployer --hp /home/deployer
pm2 save
```

### 7.2 Nginx最終設定
```nginx
# /etc/nginx/sites-available/awaseru
server {
    listen 80;
    server_name awaseru.net;
    
    # セキュリティヘッダーの追加
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # basePath対応
    location /app/ {
        proxy_pass http://localhost:3000/app/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # タイムアウト設定
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静的ファイルのキャッシュ設定
    location /app/_next/static/ {
        proxy_cache_bypass $http_upgrade;
        proxy_pass http://localhost:3000/app/_next/static/;
        expires 365d;
        access_log off;
    }

    location /app/static/ {
        proxy_cache_bypass $http_upgrade;
        proxy_pass http://localhost:3000/app/static/;
        expires 365d;
        access_log off;
    }

    # ルートへのアクセスを/appにリダイレクト
    location = / {
        return 301 /app/;
    }

    # 大きなファイルのアップロード対応
    client_max_body_size 50m;

    # アクセスログとエラーログ
    access_log /var/log/nginx/awaseru.access.log;
    error_log /var/log/nginx/awaseru.error.log;
}
```

### 7.3 DNS設定
1. XServerコントロールパネルでDNS設定を行う
2. 以下のレコードを追加：
   - ホスト名: awaseru.net
   - 種別: A
   - 内容: [VPSのIPアドレス]
   - TTL: 3600

### 7.4 設定確認コマンド
```bash
# Nginx設定の構文チェック
sudo nginx -t

# Nginx再起動
sudo systemctl restart nginx

# Nginxのステータス確認
sudo systemctl status nginx

# DNSの設定確認
dig awaseru.net

# アプリケーションの動作確認
curl -I http://[VPSのIPアドレス]/app/
```

## 8. SSL証明書セットアップ（準備中）
Let's Encryptを使用した無料SSL証明書の取得手順（DNS設定の反映後に実施）



## 9. セットアップ後の確認

### 9.1 動作確認項目
1. deployer ユーザーでのSSH接続
2. ファイアウォールの状態確認 (`ufw status`)
3. Nginxの設定テスト (`nginx -t`)
4. Node.jsとnpmのバージョン確認
5. システムのリソース状態確認 (`top`, `df -h`)

### 9.2 セキュリティ確認項目
1. rootログイン無効化の確認
2. SSHキー認証の動作確認
3. ファイアウォールルールの確認
4. 各種ログの確認 (`/var/log/auth.log`, `/var/log/nginx/error.log`)


## 10. SSH接続トラブルシューティング

### 10.1 一般的な接続手順
```bash
# 基本的な接続コマンド
ssh -i ~/Projects/awaseru-net/awaseru.pem root@162.43.21.137

# 初回接続時の表示
The authenticity of host '162.43.21.137 (162.43.21.137)' can't be established.
ED25519 key fingerprint is SHA256:3UoKGryirr/Wa0T7GImhKvuJehFTJ7mCjpbda7Cs3dQ.
# 「yes」と入力して続行
```

### 10.2 接続エラーとトラブルシューティング

#### 10.2.1 タイムアウトエラーの場合
エラーメッセージ例：
```
ssh: connect to host 162.43.21.137 port 22: Operation timed out
```

対処手順：
1. IPアドレスでの直接接続を試みる
2. ホスト名での接続を試みる
3. 複数回試行する（ネットワーク状態により一時的にタイムアウトする場合がある）

#### 10.2.2 正常接続時の確認項目
- Ubuntu Welcomeメッセージの表示
- システム情報の確認
  - メモリ使用状況
  - ディスク使用状況
  - IPアドレス
  - カーネルバージョン
- 必要なアップデートの有無

### 10.3 初期接続後の注意事項
- システムアップデートの確認
- カーネルアップグレードの必要性確認
- 再起動の必要性確認

### 10.4 トラブルシューティングのベストプラクティス
1. まずIPアドレスでの接続を試みる
2. タイムアウトの場合は複数回試行
3. 接続成功後、システム状態を必ず確認
4. アップデート情報の確認


