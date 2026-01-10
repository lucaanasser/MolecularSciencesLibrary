#!/bin/bash
# Script para atualização semanal das disciplinas da USP
# Configurar no crontab para rodar semanalmente (ex: domingo às 3h da manhã)
# 0 3 * * 0 /home/luca/BibliotecaCM/scripts/scrape-disciplines-cron.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/scrape-disciplines-$(date +%Y%m%d_%H%M%S).log"

# Criar diretório de logs se não existir
mkdir -p "$LOG_DIR"

echo "=== Scraping de Disciplinas USP ===" | tee -a "$LOG_FILE"
echo "Iniciado em: $(date)" | tee -a "$LOG_FILE"
echo "Diretório do projeto: $PROJECT_DIR" | tee -a "$LOG_FILE"

# Ir para o diretório do backend
cd "$BACKEND_DIR"

# Executar o scraping (sem --clear para não perder dados em caso de falha parcial)
# Use --clear apenas se quiser limpar tudo antes
echo "Executando scraping..." | tee -a "$LOG_FILE"
node scripts/scrapeUSPDisciplines.js 2>&1 | tee -a "$LOG_FILE"

EXIT_CODE=${PIPESTATUS[0]}

echo "" | tee -a "$LOG_FILE"
echo "Finalizado em: $(date)" | tee -a "$LOG_FILE"
echo "Exit code: $EXIT_CODE" | tee -a "$LOG_FILE"

# Limpar logs antigos (manter últimos 30 dias)
find "$LOG_DIR" -name "scrape-disciplines-*.log" -mtime +30 -delete 2>/dev/null || true

# Verificar contagem de registros
echo "" | tee -a "$LOG_FILE"
echo "=== Estatísticas do Banco ===" | tee -a "$LOG_FILE"
sqlite3 "$PROJECT_DIR/database/library.db" "
SELECT 'Disciplinas: ' || COUNT(*) FROM disciplines;
SELECT 'Turmas: ' || COUNT(*) FROM discipline_classes;
SELECT 'Horários: ' || COUNT(*) FROM class_schedules;
SELECT 'Professores: ' || COUNT(*) FROM class_professors;
" 2>&1 | tee -a "$LOG_FILE"

exit $EXIT_CODE
