#!/bin/bash

# Hook de renovação do certbot - executa após renovação bem-sucedida
# Este script será executado automaticamente quando o certbot renovar os certificados

echo "🔵 [$(date)] Certificados SSL renovados pelo certbot"

# Navegar para o diretório do projeto (ajustar se necessário)
cd /root/MolecularSciencesLibrary

# Executar o script de cópia
./scripts/copy-ssl-certs.sh

# Log do resultado
if [ $? -eq 0 ]; then
    echo "✅ [$(date)] Certificados copiados com sucesso após renovação"
    
    # Reiniciar container do frontend para usar novos certificados
    if command -v "docker compose" &> /dev/null; then
        docker compose restart frontend
    else
        docker-compose restart frontend
    fi
    
    echo "🔄 [$(date)] Container do frontend reiniciado com novos certificados"
else
    echo "❌ [$(date)] Erro ao copiar certificados após renovação"
fi
