#!/bin/bash

# Script para corrigir permissões do banco de dados
# Execute com: bash scripts/fix-db-permissions.sh

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="$PROJECT_DIR/database/library.db"

echo "🔧 Corrigindo permissões do banco de dados..."

# Verificar se o banco existe
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Banco de dados não encontrado em: $DB_PATH"
    exit 1
fi

# Mostrar permissões atuais
echo ""
echo "📋 Permissões atuais:"
ls -lh "$DB_PATH"

# Corrigir permissões (se necessário usar sudo)
if [ "$(stat -c '%U' "$DB_PATH")" = "root" ]; then
    echo ""
    echo "⚠️  Banco pertence ao root, corrigindo..."
    sudo chown $USER:$USER "$DB_PATH"
    chmod 664 "$DB_PATH"
else
    chmod 664 "$DB_PATH"
fi

# Corrigir permissões dos arquivos WAL e SHM se existirem
if [ -f "$DB_PATH-wal" ]; then
    [ "$(stat -c '%U' "$DB_PATH-wal")" = "root" ] && sudo chown $USER:$USER "$DB_PATH-wal"
    chmod 664 "$DB_PATH-wal"
fi

if [ -f "$DB_PATH-shm" ]; then
    [ "$(stat -c '%U' "$DB_PATH-shm")" = "root" ] && sudo chown $USER:$USER "$DB_PATH-shm"
    chmod 664 "$DB_PATH-shm"
fi

# Garantir que o diretório também está acessível
chmod 775 "$PROJECT_DIR/database"

echo ""
echo "📋 Permissões atualizadas:"
ls -lh "$DB_PATH"

echo ""
echo "✅ Permissões corrigidas!"
