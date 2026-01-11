#!/bin/bash

# Script para configurar aliases na VPS
# Execute este script UMA VEZ na VPS para configurar atalhos globais

set -e

echo "🔧 Configurando aliases para BibliotecaCM..."
echo ""

# Detectar o diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Arquivo de aliases
ALIAS_FILE="$HOME/.bash_aliases"

# Criar arquivo se não existir
touch "$ALIAS_FILE"

# Remover aliases antigos do BibliotecaCM se existirem
sed -i '/# BibliotecaCM aliases/,/# End BibliotecaCM aliases/d' "$ALIAS_FILE"

# Adicionar novos aliases
cat >> "$ALIAS_FILE" << EOF

# BibliotecaCM aliases
alias aliases='bash $PROJECT_DIR/scripts/show-aliases.sh'
alias save='bash $PROJECT_DIR/scripts/save.sh'
alias clean='bash $PROJECT_DIR/scripts/clean.sh'
alias biblioteca='cd $PROJECT_DIR'
alias restart='cd $PROJECT_DIR && npm run start'
alias dev='cd $PROJECT_DIR && npm run dev'
alias deploy='cd $PROJECT_DIR && git pull && npm run start'
alias logs='cd $PROJECT_DIR && docker compose logs -f'
alias status='cd $PROJECT_DIR && docker compose ps'
alias stop='cd $PROJECT_DIR && docker compose down'
alias seed='cd $PROJECT_DIR && npm run seed'
alias backup='cd $PROJECT_DIR && npm run backup:db'
alias scrape='cd $PROJECT_DIR && npm run scrape:disciplines'
alias db='cd $PROJECT_DIR && sqlite3 database/library.db'
alias rebuild='cd $PROJECT_DIR && docker compose down && docker system prune -af --volumes && docker compose up -d --build'
# End BibliotecaCM aliases
EOF

echo "✅ Aliases configurados em $ALIAS_FILE"
echo "📋 Aliases disponíveis (de qualquer pasta):"
echo "   ℹ️  Ajuda:"
echo "   aliases     - Mostrar todos os aliases disponíveis"
echo ""
echo "   💾 Git:"
echo "   save        - Git add + commit + push (pede mensagem)"
echo ""
echo "   🧹 Manutenção:"
echo "   clean       - Limpa logs, Docker e libera espaço"
echo ""
echo "   🚀 Deploy & Containers:"
echo "   🚀 Deploy & Containers:"
echo "   biblioteca  - Vai para pasta do projeto"
echo "   biblioteca  - Vai para pasta do projeto"
echo "   restart     - Reinicia produção (prune + SSL)"
echo "   dev         - Menu de desenvolvimento"
echo "   deploy      - Git pull + restart (deploy completo)"
echo "   rebuild     - Rebuild completo (down + prune + build)"
echo "   stop        - Para todos os containers"
echo ""
echo "   📊 Monitoramento:"
echo "   logs        - Ver logs dos containers em tempo real"
echo "   status      - Status dos containers"
echo ""
echo "   🗄️  Banco & Dados:"
echo "   db          - Abre SQLite CLI do banco"
echo "   seed        - Popular banco com dados iniciais"
echo "   backup      - Backup do banco no Google Drive"
echo "   scrape      - Atualizar disciplinas da USP"
echo ""
echo "🔄 Para ativar agora, rode:"
echo "   source ~/.bash_aliases"
echo ""
echo "   (Ou feche e abra o terminal)"
