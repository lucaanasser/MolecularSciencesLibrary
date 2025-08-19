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


# Só tenta criar a pasta no Drive se ela não existir
if ! rclone --config "$RCLONE_CONF" lsf "$REMOTE:" | grep -Fxq "$BACKUP_FOLDER_NAME/"; then
  echo "[backup] Criando pasta '$BACKUP_FOLDER_NAME' no Google Drive..."
  rclone --config "$RCLONE_CONF" mkdir "$TARGET_DIR" --timeout=60s || true
fi

# Cria o backup local
cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_FILE"


# Só faz upload se o arquivo local não existe no Drive
if ! rclone --config "$RCLONE_CONF" lsf "$TARGET_DIR" | grep -Fxq "$BACKUP_FILE"; then
  echo "[backup] Enviando backup para o Google Drive..."
  rclone --config "$RCLONE_CONF" copy "$BACKUP_DIR/$BACKUP_FILE" "$TARGET_DIR" --timeout=120s
else
  echo "[backup] Backup já existe no Google Drive, não será reenviado."
fi


# Remove o arquivo de backup local recém-criado
rm -f "$BACKUP_DIR/$BACKUP_FILE"

# Mantém apenas os 7 backups locais mais recentes
echo "[backup] Mantendo apenas os 7 backups locais mais recentes..."
LOCAL_BACKUPS=$(ls -1t "$BACKUP_DIR"/library_*.db 2>/dev/null)
COUNT=0

LOCAL_BACKUPS=( $(ls -1t "$BACKUP_DIR"/library_*.db 2>/dev/null) )
if [ ${#LOCAL_BACKUPS[@]} -gt 7 ]; then
  for ((i=7; i<${#LOCAL_BACKUPS[@]}; i++)); do
    echo "[backup] Removendo backup local antigo: ${LOCAL_BACKUPS[$i]}"
    rm -f "${LOCAL_BACKUPS[$i]}"
  done
fi

echo "[backup] Backup enviado para '$BACKUP_FOLDER_NAME' com sucesso!"

BACKUPS_ON_DRIVE=$(rclone --config "$RCLONE_CONF" -vv lsf "$TARGET_DIR" --timeout=60s | grep '^library_' | sort -r)
COUNT=0

DRIVE_BACKUPS=( $(rclone --config "$RCLONE_CONF" lsf "$TARGET_DIR" --timeout=60s | grep '^library_' | sort -r) )
if [ ${#DRIVE_BACKUPS[@]} -gt 7 ]; then
  for ((i=7; i<${#DRIVE_BACKUPS[@]}; i++)); do
    echo "[backup] Removendo backup antigo do Google Drive: ${DRIVE_BACKUPS[$i]}"
    rclone --config "$RCLONE_CONF" deletefile "$TARGET_DIR/${DRIVE_BACKUPS[$i]}" --timeout=60s || true
  done
fi