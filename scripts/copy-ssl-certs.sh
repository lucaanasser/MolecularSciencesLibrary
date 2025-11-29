#!/bin/bash

# Script para copiar certificados Let's Encrypt reais para a pasta ssl
# Isso resolve o problema de links simbólicos no Docker

LETSENCRYPT_DIR="/etc/letsencrypt/live/bibliotecamoleculares.com"
PROJECT_DIR="/root/MolecularSciencesLibrary"
SSL_DIR="$PROJECT_DIR/ssl"

echo "🔵 [$(date)] Copiando certificados Let's Encrypt..."
echo "   Origem: $LETSENCRYPT_DIR"
echo "   Destino: $SSL_DIR"

if [ -f "$LETSENCRYPT_DIR/fullchain.pem" ] && [ -f "$LETSENCRYPT_DIR/privkey.pem" ]; then
    # Criar diretório SSL se não existir
    mkdir -p "$SSL_DIR"
    
    # Remove arquivos antigos se existirem
    rm -f "$SSL_DIR/certificate.crt" "$SSL_DIR/private.key"
    
    # Copia os certificados reais
    cp "$LETSENCRYPT_DIR/fullchain.pem" "$SSL_DIR/certificate.crt"
    cp "$LETSENCRYPT_DIR/privkey.pem" "$SSL_DIR/private.key"
    
    # Define permissões adequadas
    chmod 644 "$SSL_DIR/certificate.crt"
    chmod 600 "$SSL_DIR/private.key"
    
    echo "🟢 Certificados copiados com sucesso!"
    echo "   - certificate.crt: $(ls -lh $SSL_DIR/certificate.crt 2>/dev/null)"
    echo "   - private.key: $(ls -lh $SSL_DIR/private.key 2>/dev/null)"
    
    # Verificar validade do certificado
    EXPIRY=$(openssl x509 -enddate -noout -in "$SSL_DIR/certificate.crt" 2>/dev/null | cut -d= -f2)
    echo "   📅 Válido até: $EXPIRY"
    
    exit 0
else
    echo "🔴 Certificados Let's Encrypt não encontrados em $LETSENCRYPT_DIR"
    echo "   Verifique se o certbot está configurado corretamente"
    ls -la "$LETSENCRYPT_DIR" 2>/dev/null || echo "   Diretório não existe!"
    exit 1
fi
