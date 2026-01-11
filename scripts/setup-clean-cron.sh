#!/bin/bash

# Script para configurar cronjob de limpeza automática
# Executa limpeza semanalmente aos domingos às 4h da manhã

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLEAN_SCRIPT="$PROJECT_DIR/scripts/clean.sh"
LOG_FILE="/var/log/biblioteca-clean.log"

echo "🔧 Configurando limpeza automática..."
echo ""

# Tornar script executável
chmod +x "$CLEAN_SCRIPT"

# Criar diretório de logs se não existir
sudo mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || mkdir -p "$HOME/logs"
LOG_FILE="${LOG_FILE:-$HOME/logs/biblioteca-clean.log}"

# Verificar se cronjob já existe
CRON_COMMAND="0 4 * * 0 bash $CLEAN_SCRIPT >> $LOG_FILE 2>&1"

if crontab -l 2>/dev/null | grep -q "clean.sh"; then
    echo "ℹ️  Cronjob de limpeza já existe"
    echo ""
    echo "📋 Cronjobs atuais relacionados:"
    crontab -l | grep "clean.sh" || true
else
    # Adicionar cronjob
    (crontab -l 2>/dev/null; echo "# BibliotecaCM - Limpeza automática semanal"; echo "$CRON_COMMAND") | crontab -
    echo "✅ Cronjob de limpeza configurado!"
    echo ""
    echo "📅 Agendamento: Domingos às 4h da manhã"
    echo "📝 Logs em: $LOG_FILE"
fi

echo ""
echo "🧪 Executando limpeza de teste..."
bash "$CLEAN_SCRIPT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Configuração concluída!"
echo ""
echo "📋 Para ver o cronjob:"
echo "   crontab -l | grep clean"
echo ""
echo "📝 Para ver logs:"
echo "   tail -f $LOG_FILE"
echo ""
echo "🗑️  Para remover o cronjob:"
echo "   crontab -e  (e delete a linha do clean.sh)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
