#!/bin/bash

# Script rápido para renovar certificados manualmente no VPS
# Execute este script se os certificados expiraram e você precisa de uma solução rápida

set -e

echo "🚨 RENOVAÇÃO MANUAL DE CERTIFICADOS SSL"
echo "========================================"
echo ""

PROJECT_DIR="/root/MolecularSciencesLibrary"
cd "$PROJECT_DIR"

# 1. Parar frontend
echo "1. Parando container frontend..."
docker compose stop frontend
echo "   ✅ Frontend parado"
echo ""

# 2. Renovar certificados
echo "2. Renovando certificados com certbot..."
certbot renew --force-renewal --webroot -w "$PROJECT_DIR/certbot/www"
echo "   ✅ Certificados renovados"
echo ""

# 3. Copiar certificados
echo "3. Copiando certificados para pasta do projeto..."
bash "$PROJECT_DIR/scripts/copy-ssl-certs.sh"
echo "   ✅ Certificados copiados"
echo ""

# 4. Reiniciar containers
echo "4. Reiniciando containers..."
docker compose up -d
echo "   ✅ Containers reiniciados"
echo ""

# 5. Verificar
echo "5. Verificando certificado do site..."
sleep 5
EXPIRY=$(echo | openssl s_client -servername bibliotecamoleculares.com -connect bibliotecamoleculares.com:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
echo "   📅 Certificado expira em: $EXPIRY"
echo ""

echo "✅ RENOVAÇÃO CONCLUÍDA!"
echo ""
echo "Acesse: https://bibliotecamoleculares.com"
echo ""
