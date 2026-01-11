#!/bin/bash

# Script para garantir que os certificados Let's Encrypt sejam sempre copiados
# antes de iniciar os containers

echo "🔵 Preparando ambiente da Biblioteca Molecular Sciences..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Erro: docker-compose.yml não encontrado. Execute este script no diretório raiz do projeto."
    echo "💡 Certifique-se de ter o Docker Compose v2+ instalado (docker compose, não docker-compose)"
    exit 1
fi

# Criar diretório ssl se não existir
mkdir -p ssl

# Copiar certificados Let's Encrypt se existirem
if [ -f "/etc/letsencrypt/live/bibliotecamoleculares.com/fullchain.pem" ] && [ -f "/etc/letsencrypt/live/bibliotecamoleculares.com/privkey.pem" ]; then
    echo "🔒 Copiando certificados Let's Encrypt..."
    cp /etc/letsencrypt/live/bibliotecamoleculares.com/fullchain.pem ssl/certificate.crt
    cp /etc/letsencrypt/live/bibliotecamoleculares.com/privkey.pem ssl/private.key
    
    # Definir permissões corretas
    chmod 644 ssl/certificate.crt
    chmod 600 ssl/private.key
    
    echo "✅ Certificados Let's Encrypt copiados com sucesso!"
    
    # Verificar se são válidos
    if openssl x509 -in ssl/certificate.crt -text -noout | grep -q "Let's Encrypt"; then
        echo "✅ Certificados Let's Encrypt válidos confirmados"
    else
        echo "⚠️  Aviso: Os certificados podem não ser do Let's Encrypt"
    fi
else
    echo "⚠️  Certificados Let's Encrypt não encontrados em /etc/letsencrypt/live/"
    echo "    O sistema usará certificados autoassinados como fallback"
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose down 2>/dev/null || echo "Nenhum container rodando"

# Limpar imagens e containers antigos
echo "🧹 Limpando imagens e containers antigos..."
docker system prune -af --volumes 2>/dev/null || echo "Nada para limpar"

# Iniciar containers
echo "🚀 Iniciando containers..."
docker compose up -d

echo "✅ Containers iniciados!"
echo ""
echo "🌐 Acesse: https://bibliotecamoleculares.com"
echo "📊 Status dos containers:"

# Mostrar status dos containers
sleep 3
docker compose ps
