#!/bin/bash
# /var/www/awaseru/scripts/setup-nginx.sh

set -e # エラーがあった場合はスクリプト終了

# 実行ユーザーがrootか確認
if [ "$EUID" -ne 0 ]; then
  echo "このスクリプトはroot権限で実行してください"
  exit 1
fi

# 設定
DOMAIN="awaseru.net"
API_DOMAIN="api.awaseru.net"
EMAIL="your-email@example.com" # Let's Encryptの通知用
NGINX_CONF_PATH="/etc/nginx/sites-available/awaseru.conf"
NGINX_ENABLED_PATH="/etc/nginx/sites-enabled/awaseru.conf"

# ログ出力関数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Nginxのセットアップを開始します..."

# Nginxがインストールされているか確認
if ! command -v nginx &> /dev/null; then
  log "Nginxがインストールされていません。インストールします..."
  apt update
  apt install -y nginx
else
  log "Nginxは既にインストールされています"
fi

# Certbotがインストールされているか確認
if ! command -v certbot &> /dev/null; then
  log "Certbotがインストールされていません。インストールします..."
  apt update
  apt install -y certbot python3-certbot-nginx
else
  log "Certbotは既にインストールされています"
fi

# Nginx設定ファイルのコピー
log "Nginx設定ファイルをコピーしています..."
cp /var/www/awaseru/nginx.conf "$NGINX_CONF_PATH"

# ドメインとメールアドレスを設定ファイルに置換
sed -i "s/awaseru.net/$DOMAIN/g" "$NGINX_CONF_PATH"
sed -i "s/api.awaseru.net/$API_DOMAIN/g" "$NGINX_CONF_PATH"

# シンボリックリンクの作成
log "Nginx設定を有効化しています..."
ln -sf "$NGINX_CONF_PATH" "$NGINX_ENABLED_PATH"

# Nginx設定のテスト
log "Nginx設定をテストしています..."
nginx -t

# Nginxの再起動
log "Nginxを再起動しています..."
systemctl restart nginx

# Let's Encryptの証明書取得
log "SSL証明書を取得しています..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m "$EMAIL"

log "Nginxのセットアップが完了しました"

exit 0