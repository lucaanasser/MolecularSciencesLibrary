#!/bin/bash

echo "🚀 Iniciando BibliotecaCM com HTTPS..."

# Verificar se os certificados SSL existem
if [ ! -f "./ssl/private.key" ] || [ ! -f "./ssl/certificate.crt" ]; then
    echo "🔧 Certificados SSL não encontrados. Gerando..."
    ./scripts/generate-ssl.sh
fi

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "🔴 Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Iniciar os containers
echo "🐳 Iniciando containers Docker..."
docker compose up --build

echo "✅ Aplicação iniciada!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔒 Backend HTTP: http://localhost:3001"
echo "🔐 Backend HTTPS: https://localhost:3443"
echo ""
echo "⚠️  Para acessar HTTPS, você precisará aceitar o certificado autoassinado no navegador."
