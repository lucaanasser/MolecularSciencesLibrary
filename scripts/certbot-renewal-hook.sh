#!/bin/bash

# Hook de renovação do certbot - executa após renovação bem-sucedida
# Este script será executado automaticamente quando o certbot renovar os certificados

echo "========================================" | tee -a /var/log/ssl-renewal.log
echo "🔵 [$(date)] Certificados SSL renovados pelo certbot" | tee -a /var/log/ssl-renewal.log

# Navegar para o diretório do projeto
PROJECT_DIR="/root/MolecularSciencesLibrary"
cd "$PROJECT_DIR" || exit 1

# Executar o script de cópia
bash "$PROJECT_DIR/scripts/copy-ssl-certs.sh" 2>&1 | tee -a /var/log/ssl-renewal.log

# Log do resultado
if [ $? -eq 0 ]; then
    echo "✅ [$(date)] Certificados copiados com sucesso após renovação" | tee -a /var/log/ssl-renewal.log
    
    # Reiniciar container do frontend para carregar novos certificados
    cd "$PROJECT_DIR"
    if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
        echo "🔄 [$(date)] Reiniciando container do frontend..." | tee -a /var/log/ssl-renewal.log
        docker compose restart frontend 2>&1 | tee -a /var/log/ssl-renewal.log
        echo "✅ [$(date)] Container do frontend reiniciado" | tee -a /var/log/ssl-renewal.log
    else
        echo "⚠️  [$(date)] Docker Compose não encontrado, pulando reinício" | tee -a /var/log/ssl-renewal.log
    fi
else
    echo "❌ [$(date)] Erro ao copiar certificados após renovação" | tee -a /var/log/ssl-renewal.log
    exit 1
fi

echo "========================================" | tee -a /var/log/ssl-renewal.log
