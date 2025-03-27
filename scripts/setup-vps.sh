#!/bin/bash
# XサーバーVPSの初期セットアップスクリプト

set -e # エラーがあった場合はスクリプト終了

# 実行ユーザーがrootか確認
if [ "$EUID" -ne 0 ]; then
  echo "このスクリプトはroot権限で実行してください"
  exit 1
fi

# 設定
APP_USER="awaseru"
APP_GROUP="awaseru"
APP_USER_HOME="/home/$APP_USER"
DEPLOY_DIR="/var/www/awaseru"
LOG_DIR="/var/log/awaseru"
BACKUP_DIR="/var/backups/awaseru"

# ログ出力関数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "XサーバーVPSのセットアップを開始します..."

# システムの更新
log "システムを更新しています..."
apt update && apt upgrade -y

# 基本パッケージのインストール
log "基本パッケージをインストールしています..."
apt install -y build-essential curl wget git vim unzip htop ncdu dirmngr gnupg \
  apt-transport-https ca-certificates software-properties-common fail2ban ufw

# タイムゾーンの設定
log "タイムゾーンを Asia/Tokyo に設定しています..."
timedatectl set-timezone Asia/Tokyo

# ファイアウォール設定
log "ファイアウォールを設定しています..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# fail2banの設定
log "fail2banを設定しています..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
EOF

systemctl restart fail2ban

# Node.jsのインストール
log "Node.jsをインストールしています..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# npmのバージョンアップデート
log "npmをアップデートしています..."
npm install -g npm@latest

# PM2のインストール
log "PM2をインストールしています..."
npm install -g pm2

# PostgreSQLのインストール
log "PostgreSQLをインストールしています..."
apt install -y postgresql postgresql-contrib

# PostgreSQLの設定
log "PostgreSQLを設定しています..."
systemctl start postgresql
systemctl enable postgresql

# アプリケーションユーザーの作成
log "アプリケーションユーザーを作成しています..."
if ! id -u "$APP_USER" &>/dev/null; then
  useradd -m -s /bin/bash -d "$APP_USER_HOME" "$APP_USER"
  mkdir -p "$APP_USER_HOME/.ssh"
  chmod 700 "$APP_USER_HOME/.ssh"
  
  # ここで公開鍵を設定することもできます
  # echo "ssh-rsa ..." > "$APP_USER_HOME/.ssh/authorized_keys"
  
  chmod 600 "$APP_USER_HOME/.ssh/authorized_keys"
  chown -R "$APP_USER:$APP_GROUP" "$APP_USER_HOME/.ssh"
fi

# ディレクトリの作成
log "アプリケーションディレクトリを作成しています..."
mkdir -p "$DEPLOY_DIR" "$LOG_DIR" "$BACKUP_DIR"
chown -R "$APP_USER:$APP_GROUP" "$DEPLOY_DIR" "$LOG_DIR" "$BACKUP_DIR"

# PostgreSQLユーザーとデータベースの作成
log "PostgreSQLデータベースを作成しています..."
sudo -u postgres psql -c "CREATE USER $APP_USER WITH PASSWORD 'secure_password_here';"
sudo -u postgres psql -c "CREATE DATABASE awaseru OWNER $APP_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE awaseru TO $APP_USER;"

# スケジュールタスクの設定（毎日3時にバックアップ）
log "バックアップスケジュールを設定しています..."
cat > /etc/cron.d/awaseru << EOF
0 3 * * * $APP_USER $DEPLOY_DIR/scripts/backup-db.sh >> $LOG_DIR/backup.log 2>&1
EOF

log "セットアップが完了しました！"
log "次のステップ:"
log "1. データベースパスワードを変更してください"
log "2. SSHキーを設定してください"
log "3. アプリケーションのデプロイを行ってください"

exit 0