#!/bin/bash

# Script de limpeza e manutenção do sistema
# Remove logs antigos, limpa Docker e libera espaço
# Mantém apenas containers ativos e dados importantes

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧹 BibliotecaCM - Limpeza e Manutenção${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# 1. Limpar logs antigos (mais de 30 dias)
echo -e "${YELLOW}📋 Limpando logs antigos...${NC}"

# Logs do sistema
if [ -d "logs" ]; then
    LOGS_DELETED=$(find logs -name "*.log" -mtime +30 -delete -print | wc -l)
    echo "   ✅ Removidos $LOGS_DELETED arquivos de log com +30 dias"
fi

# Logs do backend (se houver pasta de logs)
if [ -d "backend/logs" ]; then
    BACKEND_LOGS=$(find backend/logs -name "*.log" -mtime +30 -delete -print | wc -l)
    echo "   ✅ Removidos $BACKEND_LOGS logs do backend com +30 dias"
fi

# Logs temporários do sistema
if [ -f "/tmp/backend.log" ]; then
    rm -f /tmp/backend.log
    echo "   ✅ Removido log temporário do backend"
fi

# Logs do npm
if [ -d "$HOME/.npm/_logs" ]; then
    find "$HOME/.npm/_logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    echo "   ✅ Limpeza de logs npm concluída"
fi

echo ""

# 2. Limpar cache de build do Docker
echo -e "${YELLOW}🐳 Limpando Docker...${NC}"

if command -v docker &> /dev/null; then
    # Remover imagens não utilizadas (sem remover as dos containers ativos)
    IMAGES_BEFORE=$(docker images -q | wc -l)
    docker image prune -af --filter "until=24h" 2>/dev/null || true
    IMAGES_AFTER=$(docker images -q | wc -l)
    IMAGES_REMOVED=$((IMAGES_BEFORE - IMAGES_AFTER))
    echo "   ✅ Removidas $IMAGES_REMOVED imagens antigas"
    
    # Remover containers parados
    CONTAINERS_STOPPED=$(docker container prune -f 2>/dev/null | grep -oP '\d+(?= container)' || echo "0")
    echo "   ✅ Removidos $CONTAINERS_STOPPED containers parados"
    
    # Remover volumes não utilizados (cuidado: não remove volumes de containers ativos)
    VOLUMES_REMOVED=$(docker volume prune -f 2>/dev/null | grep -oP '\d+(?= volume)' || echo "0")
    echo "   ✅ Removidos $VOLUMES_REMOVED volumes não utilizados"
    
    # Remover redes não utilizadas
    NETWORKS_REMOVED=$(docker network prune -f 2>/dev/null | grep -oP '\d+(?= network)' || echo "0")
    echo "   ✅ Removidas $NETWORKS_REMOVED redes não utilizadas"
    
    # Limpar build cache (mantém cache de 7 dias)
    docker builder prune -af --filter "until=168h" 2>/dev/null || true
    echo "   ✅ Cache de build limpo"
else
    echo "   ⚠️  Docker não encontrado, pulando limpeza"
fi

echo ""

# 3. Limpar arquivos temporários do projeto
echo -e "${YELLOW}🗑️  Limpando arquivos temporários...${NC}"

# Node modules cache
if [ -d "backend/.cache" ]; then
    rm -rf backend/.cache
    echo "   ✅ Cache do backend removido"
fi

if [ -d "frontend/.cache" ]; then
    rm -rf frontend/.cache
    echo "   ✅ Cache do frontend removido"
fi

# Arquivos .DS_Store (macOS)
find . -name ".DS_Store" -delete 2>/dev/null || true
echo "   ✅ Arquivos .DS_Store removidos"

# Arquivos temporários do npm
find . -name "npm-debug.log*" -delete 2>/dev/null || true
find . -name "yarn-error.log*" -delete 2>/dev/null || true
echo "   ✅ Logs de erro npm/yarn removidos"

echo ""

# 4. Limpar backups antigos locais (manter últimos 7 dias)
echo -e "${YELLOW}💾 Limpando backups locais antigos...${NC}"

if [ -d "database/backups" ]; then
    BACKUPS_DELETED=$(find database/backups -name "*.db" -mtime +7 -delete -print | wc -l)
    echo "   ✅ Removidos $BACKUPS_DELETED backups locais com +7 dias"
else
    echo "   ℹ️  Nenhuma pasta de backups encontrada"
fi

echo ""

# 5. Estatísticas de espaço liberado
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Limpeza concluída!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Mostrar estatísticas do Docker
if command -v docker &> /dev/null; then
    echo -e "${BLUE}📊 Uso atual do Docker:${NC}"
    docker system df 2>/dev/null || true
    echo ""
fi

# Mostrar espaço em disco
echo -e "${BLUE}💽 Espaço em disco:${NC}"
df -h . | tail -1 | awk '{print "   Usado: "$3" / "$2" ("$5")"}'
echo ""

echo -e "${YELLOW}💡 Dica: Este script roda automaticamente toda semana via cron${NC}"
echo -e "${YELLOW}   Para ver containers ativos: ${NC}${GREEN}status${NC}"
