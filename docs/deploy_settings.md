# デプロイ設定と修正計画（2024-11-16）

## 1. 現在の設定（正常動作確認済み）

### 1.1 ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'awaseru',
    script: '.next/standalone/server.js',
    cwd: '/var/www/awaseru/current',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### 1.2 nginx設定（/etc/nginx/sites-available/awaseru）

```javascript
server {
    listen 443 ssl;
    server_name awaseru.net;
    ssl_certificate /etc/letsencrypt/live/awaseru.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/awaseru.net/privkey.pem;

    root /var/www/awaseru/current;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        alias /var/www/awaseru/current/.next/static;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /icons {
        alias /var/www/awaseru/current/public/icons;
    }
}

server {
    if ($host = awaseru.net) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name awaseru.net;
    return 404;
}
```

### 1.3 next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  experimental: {
  }
};

module.exports = nextConfig;
```

## 2. 必要な修正内容
### 2.1 技術的修正

next.config.jsから不要な環境変数設定を削除

env セクションを削除（NEXT_PUBLIC_環境変数は自動的に利用可能）
.env.production での管理に一本化



### 2.2 機能・UI修正

EventEditor コンポーネントの修正

フォーム枠のサイズ修正
カレンダー表示機能の復旧
参加者追加機能の修正
※ 上記はスマホ表示のみ修正

レスポンシブデザインの改善

viewport設定の見直し
入力時の拡大・縮小動作の制御
スマートフォン表示の最適化


共有機能の追加

URLコピーボタンの配置変更
デザイン：共有マーク + "参加者へ共有する"
配置：調整グリッドとおすすめ日程の間



## 3. 修正手順と注意事項
### 3.1 設定変更手順

変更前に必ず現在の設定をバックアップ
各修正は個別のデプロイとして実施
変更ごとに動作確認を実施

### 3.2 デプロイ時の確認項目

Nginx設定の構文チェック
PM2プロセスの正常起動
スタイルの適用確認
レスポンシブ動作の確認
機能の動作確認

### 3.3 緊急時の対応

前回の正常動作確認済みコードに戻す手順を用意
設定ファイルのバックアップを保持