#!/bin/bash

# Script para mostrar os aliases disponíveis da BibliotecaCM

# Cores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

clear
echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════════════╗"
echo "║         BibliotecaCM - Aliases Disponíveis         ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BOLD}ℹ️  Ajuda:${NC}"
echo -e "   ${GREEN}aliases${NC}     - Mostrar todos os aliases (este comando)"
echo ""
echo -e "${BOLD}💾 Git:${NC}"
echo -e "   ${GREEN}save${NC}        - Git add + commit + push (pede mensagem)"
echo ""
echo -e "${BOLD}🧹 Manutenção:${NC}"
echo -e "   ${GREEN}clean${NC}       - Limpa logs, Docker e libera espaço"
echo ""
echo -e "${BOLD}🚀 Deploy & Containers:${NC}"
echo -e "   ${GREEN}biblioteca${NC}  - Vai para pasta do projeto"
echo -e "   ${GREEN}restart${NC}     - Reinicia produção (prune + SSL)"
echo -e "   ${GREEN}dev${NC}         - Menu de desenvolvimento"
echo -e "   ${GREEN}deploy${NC}      - Git pull + restart (deploy completo)"
echo -e "   ${GREEN}rebuild${NC}     - Rebuild completo (down + prune + build)"
echo -e "   ${GREEN}stop${NC}        - Para todos os containers"
echo ""
echo -e "${BOLD}📊 Monitoramento:${NC}"
echo -e "   ${GREEN}logs${NC}        - Ver logs dos containers em tempo real"
echo -e "   ${GREEN}status${NC}      - Status dos containers"
echo ""
echo -e "${BOLD}🗄️  Banco & Dados:${NC}"
echo -e "   ${GREEN}db${NC}          - Abre SQLite CLI do banco"
echo -e "   ${GREEN}fixdb${NC}       - Corrige permissões do banco de dados"
echo -e "   ${GREEN}seed${NC}        - Popular banco com dados iniciais"
echo -e "   ${GREEN}dseed${NC}       - Mostra informações da seed (usuários, senhas, livros)"
echo -e "   ${GREEN}backup${NC}      - Backup do banco no Google Drive"
echo -e "   ${GREEN}scrape${NC}      - Atualizar disciplinas da USP"
echo ""
echo -e "${YELLOW}💡 Dica:${NC} Todos os aliases funcionam de qualquer pasta!"
echo ""
