#!/bin/bash

# Hook de renovação do certbot - executa após renovação bem-sucedida
# Este script será executado automaticamente quando o certbot renovar os certificados

echo "🔵 [$(date)] Certificados SSL renovados pelo certbot"

# Executar o script de cópia
/root/MolecularSciencesLibrary/scripts/copy-ssl-certs.sh

# Log do resultado
if [ $? -eq 0 ]; then
    echo "✅ [$(date)] Certificados copiados com sucesso após renovação"
else
    echo "❌ [$(date)] Erro ao copiar certificados após renovação"
fi
