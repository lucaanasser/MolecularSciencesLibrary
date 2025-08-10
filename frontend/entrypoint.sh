#!/bin/sh
set -e

CERT_DIR="/etc/letsencrypt"
CRT="$CERT_DIR/certificate.crt"
KEY="$CERT_DIR/private.key"

LE_CERT_DIR="$CERT_DIR/live/bibliotecamoleculares.com"
LE_CRT="$LE_CERT_DIR/fullchain.pem"
LE_KEY="$LE_CERT_DIR/privkey.pem"

mkdir -p "$CERT_DIR"

echo "🔍 Verificando certificados SSL..."

if [ -f "$LE_CRT" ] && [ -f "$LE_KEY" ]; then
    echo "✅ Certificados Let's Encrypt encontrados. Usando certificados reais."
    ln -sf "$LE_CRT" "$CRT"
    ln -sf "$LE_KEY" "$KEY"
else
    echo "❌ Certificados reais NÃO encontrados! O container será finalizado."
    exit 1
fi

echo "Iniciando Nginx..."
exec nginx -g "daemon off;"