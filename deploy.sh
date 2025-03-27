#!/bin/bash

# ビルド
npm run build

# 環境変数の設定確認
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found"
    exit 1
fi

# PM2の設定（必要な場合）
# pm2 start npm --name "awaseru-app" -- start