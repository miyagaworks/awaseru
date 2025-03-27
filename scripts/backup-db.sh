#!/bin/bash
# /var/www/awaseru/scripts/backup-db.sh

# 設定
BACKUP_DIR="/var/backups/awaseru/postgres"
DB_NAME="awaseru"
DB_USER="postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"
RETENTION_DAYS=30

# ログ出力関数
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# バックアップディレクトリの作成
mkdir -p "$BACKUP_DIR"

log "PostgreSQLバックアップを開始します..."

# データベースのダンプ
if pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"; then
  log "バックアップが完了しました: $BACKUP_FILE"
  
  # バックアップファイルの圧縮
  log "バックアップファイルを圧縮しています..."
  gzip "$BACKUP_FILE"
  log "圧縮が完了しました: $BACKUP_FILE.gz"
  
  # 古いバックアップファイルの削除
  log "$RETENTION_DAYS日以上前のバックアップファイルを削除しています..."
  find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
  find "$BACKUP_DIR" -name "${DB_NAME}_*.sql" -type f -mtime +$RETENTION_DAYS -delete
else
  log "バックアップ中にエラーが発生しました"
  exit 1
fi

# バックアップ情報の表示
BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" | wc -l)

log "バックアップ完了:"
log "- 最新のバックアップサイズ: $BACKUP_SIZE"
log "- バックアップ数: $BACKUP_COUNT"
log "- バックアップディレクトリの合計サイズ: $TOTAL_SIZE"
log "- バックアップ保存場所: $BACKUP_DIR"

exit 0