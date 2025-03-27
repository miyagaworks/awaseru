#!/bin/bash
# /var/www/awaseru/scripts/deploy.sh

set -e # エラーがあった場合はスクリプト終了

# ログ出力関数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# デプロイディレクトリ
DEPLOY_DIR="/var/www/awaseru"
FRONTEND_DIR="$DEPLOY_DIR/frontend"
BACKEND_DIR="$DEPLOY_DIR/backend"
LOG_DIR="/var/log/pm2"

# ログディレクトリの作成
mkdir -p "$LOG_DIR"

log "デプロイを開始します"

# バックエンドの更新
if [ -d "$BACKEND_DIR" ]; then
  log "バックエンドの更新を開始します..."
  cd "$BACKEND_DIR"
  
  # 変更を取得
  git pull
  
  # 依存関係をインストール
  log "バックエンドの依存関係をインストールしています..."
  npm ci
  
  # PM2で再起動
  log "バックエンドを再起動しています..."
  pm2 reload awaseru-backend
  
  log "バックエンドの更新が完了しました"
else
  log "バックエンドディレクトリが存在しません。クローンします..."
  mkdir -p "$BACKEND_DIR"
  git clone https://github.com/yourusername/awaseru-backend.git "$BACKEND_DIR"
  
  cd "$BACKEND_DIR"
  
  # 依存関係をインストール
  log "バックエンドの依存関係をインストールしています..."
  npm ci
  
  # PM2で起動
  log "バックエンドを起動しています..."
  pm2 start --name awaseru-backend server.js
  
  log "バックエンドのセットアップが完了しました"
fi

# フロントエンドの更新
if [ -d "$FRONTEND_DIR" ]; then
  log "フロントエンドの更新を開始します..."
  cd "$FRONTEND_DIR"
  
  # 変更を取得
  git pull
  
  # 依存関係をインストール
  log "フロントエンドの依存関係をインストールしています..."
  npm ci
  
  # ビルド
  log "フロントエンドをビルドしています..."
  npm run build
  
  # PM2で再起動
  log "フロントエンドを再起動しています..."
  pm2 reload awaseru-frontend
  
  log "フロントエンドの更新が完了しました"
else
  log "フロントエンドディレクトリが存在しません。クローンします..."
  mkdir -p "$FRONTEND_DIR"
  git clone https://github.com/yourusername/awaseru-frontend.git "$FRONTEND_DIR"
  
  cd "$FRONTEND_DIR"
  
  # 依存関係をインストール
  log "フロントエンドの依存関係をインストールしています..."
  npm ci
  
  # ビルド
  log "フロントエンドをビルドしています..."
  npm run build
  
  # PM2で起動
  log "フロントエンドを起動しています..."
  pm2 start --name awaseru-frontend npm -- start
  
  log "フロントエンドのセットアップが完了しました"
fi

# PM2の設定を保存
log "PM2の設定を保存しています..."
pm2 save

log "デプロイが完了しました"