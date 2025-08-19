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
REMOTE="gdrive"
BACKUP_FOLDER_NAME="Backup Database"
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
## Não exige mais o ID da pasta raiz, usa apenas o nome da pasta

# Cria pasta de backup local se não existir
mkdir -p "$BACKUP_DIR"

echo "[backup] Garantindo que a pasta '$BACKUP_FOLDER_NAME' existe no Google Drive..."
rclone --config "$RCLONE_CONF" -vv mkdir "$TARGET_DIR" --timeout=60s || true

# Cria o backup local
cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_FILE"

# Envia para o Google Drive usando rclone (para a subpasta)
rclone --config "$RCLONE_CONF" -vv copy "$BACKUP_DIR/$BACKUP_FILE" "$TARGET_DIR" --timeout=120s


# Remove o arquivo de backup local recém-criado
rm -f "$BACKUP_DIR/$BACKUP_FILE"

# Mantém apenas os 7 backups locais mais recentes
echo "[backup] Mantendo apenas os 7 backups locais mais recentes..."
LOCAL_BACKUPS=$(ls -1t "$BACKUP_DIR"/library_*.db 2>/dev/null)
COUNT=0
for file in $LOCAL_BACKUPS; do
  COUNT=$((COUNT+1))
  if [ $COUNT -gt 7 ]; then
    echo "[backup] Removendo backup local antigo: $file"
    rm -f "$file"
  fi
done

echo "[backup] Backup enviado para '$BACKUP_FOLDER_NAME' com sucesso!"

BACKUPS_ON_DRIVE=$(rclone --config "$RCLONE_CONF" -vv lsf "$TARGET_DIR" --timeout=60s | grep '^library_' | sort -r)
COUNT=0
for file in $BACKUPS_ON_DRIVE; do
  COUNT=$((COUNT+1))
  if [ $COUNT -gt 7 ]; then
    echo "[backup] Removendo backup antigo do Google Drive: $file"
    rclone --config "$RCLONE_CONF" -vv deletefile "$TARGET_DIR/$file" --timeout=60s || true
  fi
done