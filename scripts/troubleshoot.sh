#!/bin/bash

echo "BibliotecaCM - Troubleshooting e Diagnósticos"
echo "=============================================="

# Verificar Docker
echo " Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "🔴 Docker não está rodando ou não está instalado"
    exit 1
else
    echo "✅ Docker está funcionando"
fi

# Verificar certificados SSL
echo "Verificando certificados SSL..."
if [ -f "./ssl/private.key" ] && [ -f "./ssl/certificate.crt" ]; then
    echo "✅ Certificados SSL encontrados"
    
    # Verificar validade do certificado
    expiry=$(openssl x509 -in ./ssl/certificate.crt -noout -enddate 2>/dev/null | cut -d= -f2)
    if [ -n "$expiry" ]; then
        echo "Válido até: $expiry"
    fi
else
    echo "🟡 Certificados SSL não encontrados"
    echo "   Execute: ./scripts/generate-ssl.sh"
fi

# Verificar banco de dados
echo "Verificando banco de dados..."
if [ -f "./database/library.db" ]; then
    echo "✅ Banco de dados encontrado"
    size=$(du -h ./database/library.db | cut -f1)
    echo "Tamanho: $size"
else
    echo "🟡 Banco de dados não encontrado (será criado automaticamente)"
fi

# Verificar containers
echo "Verificando containers..."
if docker compose ps >/dev/null 2>&1; then
    docker compose ps
else
    echo "🟡 Nenhum container rodando"
fi

# Verificar portas
echo "Verificando portas..."
for port in 3001 3443 8080; do
    if ss -tuln | grep ":$port " >/dev/null 2>&1; then
        echo "✅ Porta $port está em uso"
    else
        echo "🟡 Porta $port está livre"
    fi
done

echo ""
echo "Comandos úteis:"
echo "   ./scripts/start-https.sh       - Iniciar com HTTPS"
echo "   docker compose down            - Parar containers"
echo "   docker compose logs backend    - Ver logs do backend"
echo "   docker compose logs cron       - Ver logs do cron"
echo "   ./scripts/generate-ssl.sh      - Gerar novos certificados"
