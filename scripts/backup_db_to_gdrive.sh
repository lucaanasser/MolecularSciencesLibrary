#!/bin/bash
set -e

# Caminho para o banco de dados
DB_PATH="/app/database/library.db"
# Caminho para a pasta de backup local
BACKUP_DIR="/app/database/backups"
# Nome do arquivo de backup
BACKUP_FILE="library_$(date +%Y-%m-%d_%H-%M-%S).db"
# Caminho para o rclone.conf
RCLONE_CONF="/app/scripts/rclone.conf"
# Nome do remote e pasta no Google Drive
REMOTE="gdrive"
DRIVE_FOLDER_ID="${GDRIVE_FOLDER_ID}"

# Cria pasta de backup local se não existir
mkdir -p "$BACKUP_DIR"

# Cria o backup local
cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_FILE"

# Envia para o Google Drive usando rclone
rclone --config "$RCLONE_CONF" copy "$BACKUP_DIR/$BACKUP_FILE" "$REMOTE:$DRIVE_FOLDER_ID"

# Remove o arquivo de backup local
rm "$BACKUP_DIR/$BACKUP_FILE"

echo "Backup do banco enviado para o Google Drive com sucesso!"

# Mantém apenas os 7 backups mais recentes na pasta do Google Drive
BACKUPS_ON_DRIVE=$(rclone --config "$RCLONE_CONF" lsf "$REMOTE:$DRIVE_FOLDER_ID" | grep library_ | sort -r)
COUNT=0
for file in $BACKUPS_ON_DRIVE; do
  COUNT=$((COUNT+1))
  if [ $COUNT -gt 7 ]; then
    echo "Removendo backup antigo do Google Drive: $file"
    rclone --config "$RCLONE_CONF" delete "$REMOTE:$DRIVE_FOLDER_ID/$file"
  fi
done