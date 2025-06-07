#!/bin/bash

# Script para gerar certificados SSL autoassinados para desenvolvimento local

# Criar diretório para certificados
mkdir -p ssl

# Gerar chave privada
openssl genrsa -out ssl/private.key 2048

# Gerar certificado autoassinado válido por 365 dias
openssl req -new -x509 -key ssl/private.key -out ssl/certificate.crt -days 365 \
  -subj "/C=BR/ST=SP/L=SaoPaulo/O=BibliotecaCM/OU=IT/CN=localhost"

# Gerar certificado DH para maior segurança
openssl dhparam -out ssl/dhparam.pem 2048

echo "Certificados SSL gerados com sucesso!"
echo "Certificados salvos em: ./ssl/"
echo "Chave privada: ssl/private.key"
echo "Certificado: ssl/certificate.crt"
echo "DH Params: ssl/dhparam.pem"
