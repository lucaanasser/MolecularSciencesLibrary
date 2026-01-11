#!/bin/bash

# Script Interativo de Desenvolvimento - BibliotecaCM
# Oferece múltiplas opções para rodar o projeto em modo desenvolvimento

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

clear
echo -e "${BLUE}${BOLD}"
echo "╔════════════════════════════════════════════════════╗"
echo "║     BibliotecaCM - Ambiente de Desenvolvimento     ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BOLD}Escolha uma opção:${NC}"
echo ""
echo -e "  ${GREEN}1)${NC} Docker Compose Completo (Frontend + Backend)"
echo -e "     ${YELLOW}→${NC} Tudo em containers com hot-reload"
echo ""
echo -e "  ${GREEN}2)${NC} Frontend Local (npm run dev)"
echo -e "     ${YELLOW}→${NC} Frontend: http://localhost:5173 (Vite dev server)"
echo -e "     ${YELLOW}→${NC} Backend: Precisa rodar separadamente"
echo ""
echo -e "  ${GREEN}3)${NC} Backend em Docker + Frontend Local com Hot-Reload"
echo -e "     ${YELLOW}→${NC} Backend em container na porta 3001"
echo -e "     ${YELLOW}→${NC} Frontend: http://localhost:5173 (Vite com proxy)"
echo ""
echo -e "  ${GREEN}4)${NC} Backend Local (npm run dev)"
echo -e "     ${YELLOW}→${NC} Backend com nodemon na porta 3001"
echo -e "     ${YELLOW}→${NC} Frontend: Precisa rodar separadamente"
echo ""
echo -e "  ${GREEN}5)${NC} Apenas Backend em Docker"
echo -e "     ${YELLOW}→${NC} Backend isolado para testes de API"
echo ""
echo -e "  ${GREEN}6)${NC} Frontend + Backend Local (Ambos com Hot-Reload)"
echo -e "     ${YELLOW}→${NC} Frontend: http://localhost:8080 (Vite)"
echo -e "     ${YELLOW}→${NC} Backend: http://localhost:3001 (Nodemon)"
echo -e "     ${YELLOW}→${NC} Melhor DX: recarregamento instantâneo"
echo ""
echo -e "  ${RED}0)${NC} Sair"
echo ""
echo -ne "${BOLD}Digite sua escolha [0-6]:${NC} "
read choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 1: Docker Compose Completo${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "🐳 Iniciando todos os serviços em containers..."
        echo ""
        
        # Verificar se existe docker-compose.dev.yml
        if [ -f "docker-compose.dev.yml" ]; then
            docker compose -f docker-compose.dev.yml down 2>/dev/null || true
            docker compose -f docker-compose.dev.yml up --build
        else
            echo -e "${YELLOW}⚠️  docker-compose.dev.yml não encontrado, usando docker-compose.yml${NC}"
            docker compose down 2>/dev/null || true
            docker compose up --build
        fi
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 2: Frontend Local (Vite Dev Server)${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Lembre-se: O backend precisa estar rodando!${NC}"
        echo -e "${YELLOW}   Execute em outro terminal:${NC}"
        echo -e "${YELLOW}   • Opção 4 (Backend Local)${NC}"
        echo -e "${YELLOW}   • Opção 5 (Backend em Docker)${NC}"
        echo ""
        echo "🎨 Iniciando frontend em modo desenvolvimento..."
        echo "🌐 URL: http://localhost:5173"
        echo ""
        
        cd frontend
        
        # Verificar se node_modules existe
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências do frontend..."
            npm install
        fi
        
        npm run dev
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 3: Backend Docker + Frontend Local${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "🐳 Iniciando backend em Docker..."
        
        # Parar containers existentes
        docker compose -f docker-compose.dev.yml down 2>/dev/null || true
        
        # Iniciar apenas o backend em background
        docker compose -f docker-compose.dev.yml up -d backend
        
        echo ""
        echo -e "${GREEN}✅ Backend rodando em: http://localhost:3001${NC}"
        echo ""
        echo "🎨 Iniciando frontend local com hot-reload..."
        echo "🌐 URL: http://localhost:5173"
        echo ""
        
        cd frontend
        
        # Verificar se node_modules existe
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências do frontend..."
            npm install
        fi
        
        # Iniciar frontend (Ctrl+C irá parar o frontend, mas backend continua)
        trap 'echo ""; echo "🛑 Frontend parado. Backend ainda está rodando em Docker."; echo "Para parar o backend: docker compose -f docker-compose.dev.yml down"; exit 0' INT
        
        npm run dev
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 4: Backend Local (Nodemon)${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Lembre-se: O frontend precisa estar rodando!${NC}"
        echo -e "${YELLOW}   Execute em outro terminal:${NC}"
        echo -e "${YELLOW}   • Opção 2 (Frontend Local)${NC}"
        echo ""
        echo "🔧 Iniciando backend com hot-reload (nodemon)..."
        echo "🌐 URL: http://localhost:3001"
        echo ""
        
        cd backend
        
        # Verificar se node_modules existe
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências do backend..."
            npm install
        fi
        
        # Verificar se nodemon está instalado
        if ! command -v nodemon &> /dev/null; then
            echo "📦 Instalando nodemon..."
            npm install -g nodemon
        fi
        
        # Inicializar banco de dados se necessário
        if [ ! -f "../database/library.db" ]; then
            echo "🗄️  Inicializando banco de dados..."
            node src/database/initDb.js
        fi
        
        npm run dev
        ;;
        
    5)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 5: Apenas Backend em Docker${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "🐳 Iniciando apenas o backend em Docker..."
        
        docker compose -f docker-compose.dev.yml down 2>/dev/null || true
        docker compose -f docker-compose.dev.yml up backend
        
        echo ""
        echo -e "${GREEN}✅ Backend rodando em: http://localhost:3001${NC}"
        ;;
        
    6)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 6: Frontend + Backend Local (Full Hot-Reload)${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${GREEN}✨ Melhor experiência de desenvolvimento!${NC}"
        echo ""
        
        # Verificar dependências
        cd "$PROJECT_DIR/backend"
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências do backend..."
            npm install
        fi
        
        cd "$PROJECT_DIR/frontend"
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências do frontend..."
            npm install
        fi
        
        # Verificar se nodemon está instalado
        if ! command -v nodemon &> /dev/null; then
            echo "📦 Instalando nodemon globalmente..."
            npm install -g nodemon
        fi
        
        # Inicializar banco de dados se necessário
        if [ ! -f "$PROJECT_DIR/database/library.db" ]; then
            echo "🗄️  Inicializando banco de dados..."
            cd "$PROJECT_DIR/backend"
            node src/database/initDb.js
        fi
        
        # Verificar se tmux ou screen está disponível
        if command -v tmux &> /dev/null; then
            echo ""
            echo "🚀 Iniciando backend e frontend em painéis separados (tmux)..."
            echo ""
            echo -e "${YELLOW}💡 Dicas do tmux:${NC}"
            echo -e "   • Ctrl+B, depois D = Desconectar (processos continuam rodando)"
            echo -e "   • Ctrl+B, depois [ = Scroll mode"
            echo -e "   • Ctrl+B, depois O = Alternar entre painéis"
            echo -e "   • Ctrl+C (em cada painel) = Parar serviços"
            echo ""
            sleep 2
            
            # Criar sessão tmux com backend e frontend
            tmux new-session -d -s biblioteca-dev -n dev
            tmux send-keys -t biblioteca-dev:dev "cd '$PROJECT_DIR/backend' && echo '🔧 Backend rodando em http://localhost:3001' && npm run dev" C-m
            tmux split-window -t biblioteca-dev:dev -h
            tmux send-keys -t biblioteca-dev:dev "cd '$PROJECT_DIR/frontend' && echo '🎨 Frontend rodando em http://localhost:8080' && npm run dev" C-m
            
            # Anexar à sessão
            tmux attach-session -t biblioteca-dev
            
        elif command -v screen &> /dev/null; then
            echo ""
            echo "🚀 Iniciando com screen..."
            echo ""
            
            # Backend em background
            screen -dmS backend bash -c "cd '$PROJECT_DIR/backend' && npm run dev"
            
            # Frontend no foreground
            echo -e "${GREEN}✅ Backend iniciado em background (screen -r backend para ver logs)${NC}"
            echo ""
            cd "$PROJECT_DIR/frontend"
            echo "🎨 Iniciando frontend..."
            npm run dev
            
        else
            echo ""
            echo -e "${YELLOW}⚠️  tmux/screen não encontrado. Usando método básico...${NC}"
            echo ""
            echo "📝 Para melhor experiência, instale tmux:"
            echo "   sudo apt install tmux  # Ubuntu/Debian"
            echo "   brew install tmux      # macOS"
            echo ""
            
            # Iniciar backend em background
            cd "$PROJECT_DIR/backend"
            npm run dev > /tmp/backend.log 2>&1 &
            BACKEND_PID=$!
            
            echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
            echo "📋 Logs do backend: tail -f /tmp/backend.log"
            echo ""
            sleep 2
            
            # Frontend no foreground
            cd "$PROJECT_DIR/frontend"
            echo "🎨 Iniciando frontend..."
            echo ""
            
            # Cleanup ao sair
            trap "echo ''; echo '🛑 Parando serviços...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT TERM
            
            npm run dev
        fi
        ;;
        
    0)
        echo ""
        echo -e "${YELLOW}👋 Até logo!${NC}"
        exit 0
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Opção inválida!${NC}"
        exit 1
        ;;
esac
