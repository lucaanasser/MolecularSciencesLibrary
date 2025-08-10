#!/bin/bash

# Script para copiar certificados Let's Encrypt reais para a pasta ssl
# Isso resolve o problema de links simbólicos no Docker

LETSENCRYPT_DIR="/etc/letsencrypt/live/bibliotecamoleculares.com-0001"
SSL_DIR="./ssl"

echo "🔵 Copiando certificados Let's Encrypt..."

if [ -f "$LETSENCRYPT_DIR/fullchain.pem" ] && [ -f "$LETSENCRYPT_DIR/privkey.pem" ]; then
    # Remove links simbólicos antigos se existirem
    rm -f "$SSL_DIR/certificate.crt" "$SSL_DIR/private.key"
    
    # Copia os certificados reais
    cp "$LETSENCRYPT_DIR/fullchain.pem" "$SSL_DIR/certificate.crt"
    cp "$LETSENCRYPT_DIR/privkey.pem" "$SSL_DIR/private.key"
    
    # Define permissões adequadas
    chmod 644 "$SSL_DIR/certificate.crt"
    chmod 600 "$SSL_DIR/private.key"
    
    echo "🟢 Certificados copiados com sucesso!"
    echo "   - certificate.crt: $(ls -la $SSL_DIR/certificate.crt)"
    echo "   - private.key: $(ls -la $SSL_DIR/private.key)"
else
    echo "🔴 Certificados Let's Encrypt não encontrados em $LETSENCRYPT_DIR"
    exit 1
fi
