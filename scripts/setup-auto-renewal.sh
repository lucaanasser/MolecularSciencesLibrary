#!/bin/bash

# Script para configurar renovação 100% automática dos certificados SSL
# Este script configura o sistema para renovação sem intervenção manual

set -e

PROJECT_DIR="/root/MolecularSciencesLibrary"
DOMAIN="bibliotecamoleculares.com"

echo "================================================"
echo "🤖 CONFIGURAÇÃO DE RENOVAÇÃO AUTOMÁTICA SSL"
echo "================================================"
echo ""

# 1. Tornar scripts executáveis
echo "1️⃣ Configurando permissões..."
chmod +x "$PROJECT_DIR/scripts/auto-renew-ssl.sh"
chmod +x "$PROJECT_DIR/scripts/copy-ssl-certs.sh"
chmod +x "$PROJECT_DIR/scripts/certbot-renewal-hook.sh"
echo "   ✅ Permissões configuradas"
echo ""

# 2. Criar arquivo de log
echo "2️⃣ Criando arquivos de log..."
touch /var/log/ssl-auto-renew.log
chmod 644 /var/log/ssl-auto-renew.log
echo "   ✅ Log criado: /var/log/ssl-auto-renew.log"
echo ""

# 3. Remover cronjobs antigos de SSL
echo "3️⃣ Limpando cronjobs antigos..."
crontab -l 2>/dev/null | grep -v "copy-ssl-certs.sh" | grep -v "certbot renew" > /tmp/crontab.tmp || true
crontab /tmp/crontab.tmp 2>/dev/null || true
rm -f /tmp/crontab.tmp
echo "   ✅ Cronjobs antigos removidos"
echo ""

# 4. Adicionar novo cronjob de renovação automática
echo "4️⃣ Configurando cronjob de renovação automática..."
CRON_JOB="0 3 * * 0 bash $PROJECT_DIR/scripts/auto-renew-ssl.sh >> /var/log/ssl-auto-renew.log 2>&1"

if ! crontab -l 2>/dev/null | grep -q "auto-renew-ssl.sh"; then
    (crontab -l 2>/dev/null; echo "# Renovação automática de certificados SSL - toda semana às 3h da manhã"; echo "$CRON_JOB") | crontab -
    echo "   ✅ Cronjob configurado: Domingos às 3h da manhã"
else
    echo "   ℹ️  Cronjob já existe"
fi
echo ""

# 5. Remover container certbot do docker-compose (não é mais necessário)
echo "5️⃣ Ajustando configuração do Docker..."
echo "   ℹ️  O container certbot foi configurado para não interferir"
echo "   ℹ️  A renovação agora é feita pelo cronjob do sistema"
echo ""

# 6. Testar o script agora (apenas se certificado estiver perto de expirar ou expirado)
echo "6️⃣ Verificando se precisa renovar agora..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    EXPIRY_EPOCH=$(date -d "$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
    
    echo "   📅 Certificado atual: $DAYS_LEFT dias restantes"
    
    if [ $DAYS_LEFT -lt 30 ]; then
        echo "   ⚠️  Certificado precisa renovação (menos de 30 dias ou expirado)"
        echo "   🔄 Executando renovação agora..."
        bash "$PROJECT_DIR/scripts/auto-renew-ssl.sh"
    else
        echo "   ✅ Certificado ainda válido, renovação não necessária agora"
        echo "   ℹ️  A renovação automática ocorrerá quando necessário"
    fi
else
    echo "   ❌ Certificado não encontrado"
    echo "   🔄 Executando renovação agora..."
    bash "$PROJECT_DIR/scripts/auto-renew-ssl.sh"
fi

echo ""
echo "================================================"
echo "📊 RESUMO DA CONFIGURAÇÃO"
echo "================================================"
echo ""
echo "✅ Script de renovação automática configurado"
echo "✅ Cronjob: Domingos às 3h da manhã (UTC)"
echo "✅ Log: /var/log/ssl-auto-renew.log"
echo ""
echo "🔄 Como funciona:"
echo "   1. Todo domingo às 3h da manhã, o script verifica os certificados"
echo "   2. Se faltarem menos de 30 dias para expirar:"
echo "      - Para o frontend temporariamente"
echo "      - Renova os certificados com certbot standalone"
echo "      - Copia para a pasta do projeto"
echo "      - Reinicia o frontend"
echo "   3. Se ainda tiver mais de 30 dias, não faz nada"
echo ""
echo "🔍 Comandos úteis:"
echo "   - Ver cronjobs: crontab -l"
echo "   - Ver logs: tail -f /var/log/ssl-auto-renew.log"
echo "   - Testar renovação: bash $PROJECT_DIR/scripts/auto-renew-ssl.sh"
echo "   - Forçar renovação: certbot renew --force-renewal --standalone"
echo ""
echo "⏰ Próxima verificação automática: Próximo domingo às 3h da manhã"
echo ""
echo "================================================"
echo "✅ CONFIGURAÇÃO 100% AUTOMÁTICA CONCLUÍDA!"
echo "================================================"
