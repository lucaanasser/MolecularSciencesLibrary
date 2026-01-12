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
echo -e "  ${GREEN}1)${NC} ${BOLD}Frontend + Backend Locais${NC}  ${YELLOW}⚡ RECOMENDADO${NC}"
echo -e "     ${YELLOW}→${NC} Frontend: ${BLUE}http://localhost:8080${NC} (Vite)"
echo -e "     ${YELLOW}→${NC} Backend: ${BLUE}http://localhost:3001${NC} (Nodemon)"
echo -e "     ${YELLOW}💡${NC} Use quando: Trabalhar em ambos simultaneamente (mudanças instantâneas)"
echo ""
echo -e "  ${GREEN}2)${NC} ${BOLD}Docker Compose${NC} (Frontend + Backend em containers)"
echo -e "     ${YELLOW}→${NC} Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "     ${YELLOW}→${NC} Backend: ${BLUE}http://localhost:3001${NC}"
echo -e "     ${YELLOW}💡${NC} Use quando: Testar ambiente similar à produção ou problemas de setup"
echo ""
echo -e "  ${GREEN}3)${NC} ${BOLD}Frontend Local${NC} (Vite dev server)"
echo -e "     ${YELLOW}→${NC} Frontend: ${BLUE}http://localhost:8080${NC} (hot-reload instantâneo)"
echo -e "     ${YELLOW}→${NC} Backend: Precisa rodar separadamente em um novo terminal(opção 4)"
echo -e "     ${YELLOW}💡${NC} Use quando: Trabalhar apenas no frontend com backend estável"
echo ""
echo -e "  ${GREEN}4)${NC} ${BOLD}Backend Local${NC} (Nodemon)"
echo -e "     ${YELLOW}→${NC} Backend: ${BLUE}http://localhost:3001${NC} (hot-reload com nodemon)"
echo -e "     ${YELLOW}→${NC} Frontend: Precisa rodar separadamente em um novo terminal(opção 3)"
echo -e "     ${YELLOW}💡${NC} Use quando: Trabalhar apenas no backend (API, lógica, banco)"
echo ""
echo -e "  ${RED}0)${NC} Sair"
echo ""
echo -ne "${BOLD}Digite sua escolha [0-4]:${NC} "
read choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 1: Frontend + Backend Local${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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
            sudo npm install -g nodemon
        fi
        
        # Inicializar banco de dados se necessário
        if [ ! -f "$PROJECT_DIR/database/library.db" ]; then
            echo "🗄️  Inicializando banco de dados..."
            cd "$PROJECT_DIR/backend"
            node src/database/initDb.js
        fi
        
        # Verificar se tmux ou screen está disponível
        if ! command -v tmux &> /dev/null && ! command -v screen &> /dev/null; then
            echo ""
            echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${BOLD}⚠️  TMUX NÃO INSTALADO${NC}"
            echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo ""
            echo -e "${YELLOW}Para rodar backend e frontend simultaneamente, você precisa:${NC}"
            echo ""
            echo -e "${BOLD}Opção A) Instalar tmux:${NC}"
            echo -e "   ${GREEN}sudo apt install tmux${NC}  # Ubuntu/Debian"
            echo -e "   ${GREEN}brew install tmux${NC}      # macOS"
            echo ""
            echo -e "${BOLD}Opção B) Usar dois terminais separados:${NC}"
            echo -e "   ${GREEN}Terminal 1:${NC} Execute ${GREEN}dev${NC} e escolha ${BOLD}Opção 4${NC} (Backend Local)"
            echo -e "   ${GREEN}Terminal 2:${NC} Execute ${GREEN}dev${NC} e escolha ${BOLD}Opção 3${NC} (Frontend Local)"
            echo ""
            echo -e "${YELLOW}Pressione qualquer tecla para voltar ao menu...${NC}"
            read -n 1 -s
            cd "$PROJECT_DIR"
            exec bash "$PROJECT_DIR/scripts/start-dev.sh"
        fi
        
        if command -v tmux &> /dev/null; then
            echo ""
            
            # Verificar se já existe uma sessão rodando
            if tmux has-session -t biblioteca-dev 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Sessão biblioteca-dev já está rodando!${NC}"
                echo "🛑 Parando sessão anterior..."
                tmux kill-session -t biblioteca-dev
                echo -e "${GREEN}✅ Sessão anterior encerrada${NC}"
                echo ""
                sleep 1
            fi
            
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
            
            # Verificar se já existe screen rodando
            if screen -list | grep -q "backend"; then
                echo -e "${YELLOW}⚠️  Screen do backend já está rodando!${NC}"
                echo "🛑 Parando screen anterior..."
                screen -S backend -X quit 2>/dev/null
                echo -e "${GREEN}✅ Screen anterior encerrado${NC}"
                echo ""
                sleep 1
            fi
            
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
            
            # Matar processos antigos que podem estar rodando
            echo "🔍 Verificando processos anteriores..."
            OLD_BACKEND_PID=$(lsof -ti:3001 2>/dev/null)
            if [ -n "$OLD_BACKEND_PID" ]; then
                echo -e "${YELLOW}⚠️  Backend já está rodando na porta 3001 (PID: $OLD_BACKEND_PID)${NC}"
                echo "🛑 Parando processo anterior..."
                kill -9 $OLD_BACKEND_PID 2>/dev/null
                echo -e "${GREEN}✅ Processo anterior encerrado${NC}"
                sleep 1
            fi
            
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
        
    2)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 2: Docker Completo${NC}"
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
        
    3)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 3: Frontend Local${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Lembre-se: O backend precisa estar rodando!${NC}"
        echo -e "${YELLOW}   Execute em outro terminal:${NC}"
        echo -e "${YELLOW}   • Opção 4 (Backend Local)${NC}"
        echo -e "${YELLOW}   • Opção 5 (Backend em Docker)${NC}"
        echo ""
        echo "🎨 Iniciando frontend em modo desenvolvimento..."
        echo "🌐 URL: http://localhost:8080"
        echo ""
        
        cd frontend
        
        # Verificar se node_modules existe
        if [ ! -d "node_modules" ]; then
            echo "📦 Instalando dependências do frontend..."
            npm install
        fi
        
        npm run dev
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}Opção 4: Backend Local${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Lembre-se: O frontend precisa estar rodando!${NC}"
        echo -e "${YELLOW}   Execute em outro terminal:${NC}"
        echo -e "${YELLOW}   • Opção 3 (Frontend Local)${NC}"
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
            sudo npm install -g nodemon
        fi
        
        # Inicializar banco de dados se necessário
        if [ ! -f "../database/library.db" ]; then
            echo "🗄️  Inicializando banco de dados..."
            node src/database/initDb.js
        fi
        
        npm run dev
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
