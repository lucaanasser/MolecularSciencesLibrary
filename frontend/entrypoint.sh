#!/bin/sh

CERT_DIR="/etc/letsencrypt"
CRT="$CERT_DIR/certificate.crt"
KEY="$CERT_DIR/private.key"

# Gera certificados autoassinados se não existirem
if [ ! -f "$CRT" ] || [ ! -f "$KEY" ]; then
  echo "Certificados não encontrados. Gerando certificados autoassinados..."
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$KEY" -out "$CRT" \
    -subj "/C=BR/ST=SP/L=SP/O=BibliotecaCM/CN=localhost"
fi

# Inicia o Nginx
nginx -g "daemon off;"
