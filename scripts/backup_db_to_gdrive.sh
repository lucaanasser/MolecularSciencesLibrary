#!/bin/bash
set -euo pipefail

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
DRIVE_FOLDER_ID="${GDRIVE_FOLDER_ID:-}"
BACKUP_FOLDER_NAME="Backup Banco de Dados"
TARGET_DIR="$REMOTE:$BACKUP_FOLDER_NAME"

# Valida pré-requisitos
if [ ! -f "$DB_PATH" ]; then
  echo "[backup] ERRO: banco não encontrado em $DB_PATH" >&2
  exit 1
fi
if [ ! -f "$RCLONE_CONF" ]; then
  echo "[backup] ERRO: rclone.conf não encontrado em $RCLONE_CONF" >&2
  exit 1
fi
if [ -z "$DRIVE_FOLDER_ID" ]; then
  echo "[backup] ERRO: variável GDRIVE_FOLDER_ID não definida" >&2
  exit 1
fi

# Cria pasta de backup local se não existir
mkdir -p "$BACKUP_DIR"

# Garante a pasta de destino no Drive (por ID da pasta raiz)
rclone --config "$RCLONE_CONF" -vv mkdir "$TARGET_DIR" \
  --drive-root-folder-id "$DRIVE_FOLDER_ID" || true

# Cria o backup local
cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_FILE"

# Envia para o Google Drive usando rclone (para a subpasta)
rclone --config "$RCLONE_CONF" -vv copy "$BACKUP_DIR/$BACKUP_FILE" "$TARGET_DIR" \
  --drive-root-folder-id "$DRIVE_FOLDER_ID"

# Remove o arquivo de backup local
rm -f "$BACKUP_DIR/$BACKUP_FILE"

echo "[backup] Backup enviado para '$BACKUP_FOLDER_NAME' com sucesso!"

# Mantém apenas os 7 backups mais recentes na subpasta do Google Drive
BACKUPS_ON_DRIVE=$(rclone --config "$RCLONE_CONF" -vv lsf "$TARGET_DIR" \
  --drive-root-folder-id "$DRIVE_FOLDER_ID" | grep '^library_' | sort -r)
COUNT=0
for file in $BACKUPS_ON_DRIVE; do
  COUNT=$((COUNT+1))
  if [ $COUNT -gt 7 ]; then
    echo "[backup] Removendo backup antigo do Google Drive: $file"
    rclone --config "$RCLONE_CONF" -vv deletefile "$TARGET_DIR/$file" \
      --drive-root-folder-id "$DRIVE_FOLDER_ID" || true
  fi
done