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

# Se os certificados reais do Certbot existirem, cria symlinks para eles
LE_CERT_DIR="$CERT_DIR/live/bibliotecamoleculares.com-0001"
LE_CRT="$LE_CERT_DIR/fullchain.pem"
LE_KEY="$LE_CERT_DIR/privkey.pem"
if [ -f "$LE_CRT" ] && [ -f "$LE_KEY" ]; then
  echo "Certificados Let's Encrypt encontrados. Usando certificados reais."
  ln -sf "$LE_CRT" "$CRT"
  ln -sf "$LE_KEY" "$KEY"
fi

# Inicia o Nginx
nginx -g "daemon off;"
