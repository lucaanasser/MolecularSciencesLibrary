#!/bin/sh
set -e

CERT_DIR="/etc/letsencrypt"
CRT="$CERT_DIR/certificate.crt"
KEY="$CERT_DIR/private.key"

LE_CERT_DIR="$CERT_DIR/live/bibliotecamoleculares.com-0001"
LE_CRT="$LE_CERT_DIR/fullchain.pem"
LE_KEY="$LE_CERT_DIR/privkey.pem"

# Garantir que o diretório de certificados existe
mkdir -p "$CERT_DIR"

echo "🔍 Verificando certificados SSL..."

# Verifica se Let's Encrypt já existe
if [ -f "$LE_CRT" ] && [ -f "$LE_KEY" ]; then
    echo "✅ Certificados Let's Encrypt encontrados. Usando certificados reais."
    ln -sf "$LE_CRT" "$CRT"
    ln -sf "$LE_KEY" "$KEY"

# Caso contrário, usa autoassinado
elif [ ! -f "$CRT" ] || [ ! -f "$KEY" ]; then
    echo "⚠️ Certificados não encontrados. Gerando certificados autoassinados..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY" -out "$CRT" \
        -subj "/C=BR/ST=SP/L=SP/O=BibliotecaCM/CN=localhost"
    echo "🔒 Certificados autoassinados gerados com sucesso."
else
    echo "✔ Certificados autoassinados existentes encontrados. Usando eles."
fi

# Inicia o Nginx
echo "Iniciando Nginx..."
exec nginx -g "daemon off;"
