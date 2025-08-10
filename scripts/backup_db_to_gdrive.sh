#!/bin/bash
set -e

DB_PATH="/app/database/library.db"
BACKUP_PATH="/app/database/library_$(date +%Y%m%d_%H%M%S).db"
GDRIVE_FOLDER_ID="${GDRIVE_FOLDER_ID}"


# Copia o banco para um arquivo de backup
cp "$DB_PATH" "$BACKUP_PATH"

# Faz upload para o Google Drive e captura o fileId
FILE_ID=$(/usr/local/bin/gdrive upload --parent "$GDRIVE_FOLDER_ID" "$BACKUP_PATH" --no-progress | awk '/Uploaded/{print $2}')

# Remove o arquivo de backup local
rm "$BACKUP_PATH"

echo "Backup do banco enviado para o Google Drive com sucesso!"

# Mantém apenas os 7 backups mais recentes na pasta do Google Drive
BACKUPS=$(/usr/local/bin/gdrive list --query "'$GDRIVE_FOLDER_ID' in parents" --name-width 0 --no-header | grep library_ | sort -r -k 2 | awk '{print $1}')
COUNT=0
for id in $BACKUPS; do
    COUNT=$((COUNT+1))
    if [ $COUNT -gt 7 ]; then
        echo "Removendo backup antigo do Google Drive: $id"
        /usr/local/bin/gdrive delete $id
    fi
done
