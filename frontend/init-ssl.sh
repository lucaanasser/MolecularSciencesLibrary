#!/bin/sh

# Script de inicialização para copiar certificados Let's Encrypt reais
# Este script garante que sempre usemos certificados válidos

echo "🔵 Iniciando verificação de certificados SSL..."

# Verificar se os certificados Let's Encrypt existem no volume montado
if [ -f "/etc/letsencrypt/certificate.crt" ] && [ -f "/etc/letsencrypt/private.key" ]; then
    echo "✅ Certificados Let's Encrypt encontrados no volume"
    
    # Verificar se são certificados válidos (não autoassinados)
    if openssl x509 -in /etc/letsencrypt/certificate.crt -text -noout | grep -q "Let's Encrypt"; then
        echo "✅ Certificados Let's Encrypt válidos detectados"
    else
        echo "⚠️  Certificados encontrados, mas podem ser autoassinados"
    fi
else
    echo "⚠️  Certificados não encontrados no volume - criando certificados autoassinados temporários"
    
    # Criar certificados autoassinados como fallback
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/letsencrypt/private.key \
        -out /etc/letsencrypt/certificate.crt \
        -subj "/C=BR/ST=SP/L=SaoPaulo/O=BibliotecaCM/OU=IT/CN=bibliotecamoleculares.com"
    
    echo "⚠️  Certificados autoassinados criados como fallback"
fi

# Definir permissões corretas
chmod 644 /etc/letsencrypt/certificate.crt
chmod 600 /etc/letsencrypt/private.key

echo "🚀 Iniciando Nginx..."
exec nginx -g "daemon off;"
