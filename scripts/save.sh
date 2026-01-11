#!/bin/bash

# Script para commit e push rápido
# Uso: save "mensagem do commit"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navegar para o diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Verificar se há mensagem de commit
if [ -z "$1" ]; then
    echo -e "${YELLOW}💬 Digite a mensagem do commit:${NC}"
    read -r COMMIT_MSG
    
    # Verificar se a mensagem não está vazia (usuário pode ter cancelado com Ctrl+C)
    if [ -z "$COMMIT_MSG" ]; then
        echo -e "${RED}❌ Operação cancelada${NC}"
        exit 1
    fi
else
    COMMIT_MSG="$1"
fi

echo ""
echo -e "${BLUE}📦 Adicionando arquivos...${NC}"
git add .

echo -e "${BLUE}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MSG"

echo -e "${BLUE}🚀 Enviando para o repositório...${NC}"
git push

echo ""
echo -e "${GREEN}✅ Alterações salvas e enviadas com sucesso!${NC}"
echo -e "${YELLOW}💡 Na VPS, rode: ${NC}${GREEN}deploy${NC}"
