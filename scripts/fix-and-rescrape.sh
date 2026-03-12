#!/bin/bash
# Script para limpar dados corrompidos de class_schedules/class_professors
# e rodar o scraping completo de disciplinas da USP.
#
# Contexto: bug onde insertClass/insertSchedule usavam o objeto inteiro de
# executeQuery como class_id, gravando '[object Object]' no banco.
#
# Uso:
#   bash scripts/fix-and-rescrape.sh
#   bash scripts/fix-and-rescrape.sh --dry-run   (apenas mostra o que seria feito)

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
fi

# ===================== CONFIGURAÇÃO =====================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
DB_FILE="$PROJECT_DIR/database/library.db"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/fix-rescrape-$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$LOG_DIR"

# ===================== CORES =====================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "$1" | tee -a "$LOG_FILE"; }

log ""
log "${BLUE}========================================${NC}"
log "${BLUE}  fix-and-rescrape.sh${NC}"
log "${BLUE}  $(date)${NC}"
log "${BLUE}========================================${NC}"
log ""

# ===================== PRÉ-CHECKS =====================

if [ ! -f "$DB_FILE" ]; then
    log "${RED}❌ Banco de dados não encontrado: $DB_FILE${NC}"
    exit 1
fi

if ! command -v sqlite3 &>/dev/null; then
    log "${RED}❌ sqlite3 não encontrado. Instale com: apt install sqlite3${NC}"
    exit 1
fi

# ===================== DIAGNÓSTICO INICIAL =====================

log "${BLUE}📊 Estado atual do banco:${NC}"
sqlite3 "$DB_FILE" "
SELECT 'Disciplinas:            ' || COUNT(*) FROM disciplines;
SELECT 'Turmas (classes):       ' || COUNT(*) FROM discipline_classes;
SELECT 'Horários corrompidos:   ' || COUNT(*) FROM class_schedules WHERE class_id = '[object Object]';
SELECT 'Professores corrompidos:' || COUNT(*) FROM class_professors WHERE class_id = '[object Object]';
SELECT 'Horários válidos:       ' || COUNT(*) FROM class_schedules WHERE class_id != '[object Object]';
" 2>&1 | tee -a "$LOG_FILE"
log ""

CORRUPTED_SCHEDULES=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM class_schedules WHERE class_id = '[object Object]';")
CORRUPTED_PROFESSORS=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM class_professors WHERE class_id = '[object Object]';")

if [ "$CORRUPTED_SCHEDULES" -eq 0 ] && [ "$CORRUPTED_PROFESSORS" -eq 0 ]; then
    log "${GREEN}✅ Nenhum dado corrompido encontrado. Pulando limpeza.${NC}"
else
    log "${YELLOW}⚠️  Encontrados: $CORRUPTED_SCHEDULES horários e $CORRUPTED_PROFESSORS professores corrompidos.${NC}"

    if [ "$DRY_RUN" = true ]; then
        log "${YELLOW}🔍 [DRY-RUN] Abortando antes de modificar o banco.${NC}"
        exit 0
    fi

    log "${BLUE}🗑️  Limpando dados corrompidos...${NC}"
    sqlite3 "$DB_FILE" "
DELETE FROM class_schedules WHERE class_id = '[object Object]';
DELETE FROM class_professors WHERE class_id = '[object Object]';
" 2>&1 | tee -a "$LOG_FILE"

    # Verificar que foram realmente removidos
    REMAINING=$(sqlite3 "$DB_FILE" "
SELECT COUNT(*) FROM class_schedules WHERE class_id = '[object Object]';
")
    if [ "$REMAINING" -ne 0 ]; then
        log "${RED}❌ Falha ao limpar: ainda existem $REMAINING linhas corrompidas.${NC}"
        exit 1
    fi
    log "${GREEN}✅ Limpeza concluída.${NC}"
    log ""
fi

# ===================== SCRAPING COMPLETO =====================

if [ "$DRY_RUN" = true ]; then
    log "${YELLOW}🔍 [DRY-RUN] Scraping não executado.${NC}"
    exit 0
fi

log "${BLUE}🌐 Iniciando scraping completo da USP JupiterWeb...${NC}"
log "   (isso pode levar vários minutos)"
log ""

cd "$PROJECT_DIR"

# Preferir rodar via Docker (onde os node_modules estão instalados),
# com fallback para node direto no host (ex: ambiente de dev local).
if command -v docker &>/dev/null && docker compose ps --services 2>/dev/null | grep -q "backend"; then
    log "${BLUE}🐳 Rodando scraping via Docker (docker compose exec backend)...${NC}"
    docker compose exec -T backend node scripts/scrapeUSPDisciplines.js 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=${PIPESTATUS[0]}
else
    log "${YELLOW}⚠️  Docker não disponível ou container backend não está rodando.${NC}"
    log "${BLUE}💻 Tentando rodar com node do host...${NC}"
    cd "$BACKEND_DIR"
    node scripts/scrapeUSPDisciplines.js 2>&1 | tee -a "$LOG_FILE"
    EXIT_CODE=${PIPESTATUS[0]}
fi

log ""
log "${BLUE}========================================${NC}"
log "${BLUE}  Finalizado em: $(date)${NC}"
log "${BLUE}  Exit code: $EXIT_CODE${NC}"
log "${BLUE}========================================${NC}"
log ""

# ===================== DIAGNÓSTICO FINAL =====================

log "${BLUE}📊 Estado final do banco:${NC}"
sqlite3 "$DB_FILE" "
SELECT 'Disciplinas:            ' || COUNT(*) FROM disciplines;
SELECT 'Turmas (classes):       ' || COUNT(*) FROM discipline_classes;
SELECT 'Horários válidos:       ' || COUNT(*) FROM class_schedules WHERE class_id != '[object Object]';
SELECT 'Professores:            ' || COUNT(*) FROM class_professors;
SELECT 'Horários corrompidos:   ' || COUNT(*) FROM class_schedules WHERE class_id = '[object Object]';
" 2>&1 | tee -a "$LOG_FILE"

log ""
log "${GREEN}📄 Log salvo em: $LOG_FILE${NC}"

# Limpar logs com mais de 30 dias
find "$LOG_DIR" -name "fix-rescrape-*.log" -mtime +30 -delete 2>/dev/null || true

exit $EXIT_CODE
