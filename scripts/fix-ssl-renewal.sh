#!/bin/bash

# Script para diagnosticar e corrigir problemas de renovação SSL
# Execute este script no VPS como root

set -e

echo "================================================"
echo "🔧 DIAGNÓSTICO E CORREÇÃO DE RENOVAÇÃO SSL"
echo "================================================"
echo ""

PROJECT_DIR="/root/MolecularSciencesLibrary"
DOMAIN="bibliotecamoleculares.com"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar certificados atuais
echo "📋 1. Verificando certificados atuais..."
echo ""

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -lt 0 ]; then
        echo -e "${RED}❌ Certificado EXPIRADO há $((0 - $DAYS_LEFT)) dias${NC}"
        echo "   Expirou em: $EXPIRY"
    elif [ $DAYS_LEFT -lt 30 ]; then
        echo -e "${YELLOW}⚠️  Certificado expira em $DAYS_LEFT dias${NC}"
        echo "   Expira em: $EXPIRY"
    else
        echo -e "${GREEN}✅ Certificado válido por mais $DAYS_LEFT dias${NC}"
        echo "   Expira em: $EXPIRY"
    fi
else
    echo -e "${RED}❌ Certificados Let's Encrypt não encontrados!${NC}"
fi

echo ""

# 2. Verificar certificados na pasta do projeto
echo "📋 2. Verificando certificados na pasta do projeto..."
if [ -f "$PROJECT_DIR/ssl/certificate.crt" ]; then
    EXPIRY_PROJECT=$(openssl x509 -enddate -noout -in "$PROJECT_DIR/ssl/certificate.crt" | cut -d= -f2)
    echo "   Certificado do projeto expira em: $EXPIRY_PROJECT"
    
    # Verificar se é autoassinado
    ISSUER=$(openssl x509 -issuer -noout -in "$PROJECT_DIR/ssl/certificate.crt")
    if echo "$ISSUER" | grep -q "Let's Encrypt"; then
        echo -e "${GREEN}   ✅ Certificado Let's Encrypt${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Certificado autoassinado ou não Let's Encrypt${NC}"
    fi
else
    echo -e "${RED}   ❌ Certificados não encontrados em $PROJECT_DIR/ssl/${NC}"
fi

echo ""

# 3. Verificar configuração do certbot
echo "📋 3. Verificando configuração do certbot..."
if [ -f "/etc/letsencrypt/renewal/$DOMAIN.conf" ]; then
    echo -e "${GREEN}   ✅ Configuração de renovação encontrada${NC}"
    echo "   Arquivo: /etc/letsencrypt/renewal/$DOMAIN.conf"
else
    echo -e "${RED}   ❌ Configuração de renovação não encontrada${NC}"
fi

echo ""

# 4. Verificar hooks do certbot
echo "📋 4. Verificando hooks de renovação..."
HOOK_DIR="/etc/letsencrypt/renewal-hooks/deploy"
if [ -d "$HOOK_DIR" ]; then
    echo "   Diretório de hooks existe"
    if [ -L "$HOOK_DIR/copy-ssl-certs.sh" ] || [ -f "$HOOK_DIR/copy-ssl-certs.sh" ]; then
        echo -e "${GREEN}   ✅ Hook de renovação configurado${NC}"
        ls -la "$HOOK_DIR/copy-ssl-certs.sh"
    else
        echo -e "${YELLOW}   ⚠️  Hook de renovação não encontrado${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Diretório de hooks não existe${NC}"
fi

echo ""

# 5. Verificar cronjobs
echo "📋 5. Verificando cronjobs..."
if crontab -l 2>/dev/null | grep -q "certbot"; then
    echo -e "${GREEN}   ✅ Cronjob do certbot encontrado:${NC}"
    crontab -l | grep certbot
else
    echo -e "${YELLOW}   ⚠️  Nenhum cronjob do certbot encontrado${NC}"
fi

if crontab -l 2>/dev/null | grep -q "copy-ssl-certs"; then
    echo -e "${GREEN}   ✅ Cronjob de cópia de certificados encontrado:${NC}"
    crontab -l | grep copy-ssl-certs
else
    echo -e "${YELLOW}   ⚠️  Nenhum cronjob de cópia encontrado${NC}"
fi

echo ""
echo "================================================"
echo "🔧 APLICANDO CORREÇÕES"
echo "================================================"
echo ""

# 6. Corrigir permissões dos scripts
echo "🔧 6. Corrigindo permissões dos scripts..."
chmod +x "$PROJECT_DIR/scripts/copy-ssl-certs.sh"
chmod +x "$PROJECT_DIR/scripts/certbot-renewal-hook.sh"
chmod +x "$PROJECT_DIR/scripts/setup-ssl-automation.sh"
echo -e "${GREEN}   ✅ Permissões corrigidas${NC}"

echo ""

# 7. Configurar hook do certbot
echo "🔧 7. Configurando hook do certbot..."
mkdir -p "$HOOK_DIR"
if [ ! -L "$HOOK_DIR/copy-ssl-certs.sh" ]; then
    ln -sf "$PROJECT_DIR/scripts/certbot-renewal-hook.sh" "$HOOK_DIR/copy-ssl-certs.sh"
    chmod +x "$HOOK_DIR/copy-ssl-certs.sh"
    echo -e "${GREEN}   ✅ Hook configurado${NC}"
else
    echo "   ℹ️  Hook já existe"
fi

echo ""

# 8. Adicionar cronjob de backup
echo "🔧 8. Configurando cronjob de backup..."
CRON_JOB="0 3 * * * $PROJECT_DIR/scripts/copy-ssl-certs.sh >> /var/log/ssl-copy.log 2>&1"

if ! crontab -l 2>/dev/null | grep -q "copy-ssl-certs.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}   ✅ Cronjob de backup adicionado${NC}"
else
    echo "   ℹ️  Cronjob já existe"
fi

# Adicionar cronjob do certbot se não existir
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    CERTBOT_CRON="0 2 * * * certbot renew --quiet --post-hook 'bash $PROJECT_DIR/scripts/certbot-renewal-hook.sh' >> /var/log/certbot-renew.log 2>&1"
    (crontab -l 2>/dev/null; echo "$CERTBOT_CRON") | crontab -
    echo -e "${GREEN}   ✅ Cronjob do certbot adicionado${NC}"
else
    echo "   ℹ️  Cronjob do certbot já existe"
fi

echo ""

# 9. Criar arquivos de log
echo "🔧 9. Criando arquivos de log..."
touch /var/log/ssl-copy.log
touch /var/log/ssl-renewal.log
touch /var/log/certbot-renew.log
chmod 644 /var/log/ssl-copy.log /var/log/ssl-renewal.log /var/log/certbot-renew.log
echo -e "${GREEN}   ✅ Arquivos de log criados${NC}"

echo ""

# 10. Copiar certificados agora
echo "🔧 10. Copiando certificados atuais..."
if bash "$PROJECT_DIR/scripts/copy-ssl-certs.sh"; then
    echo -e "${GREEN}   ✅ Certificados copiados com sucesso${NC}"
else
    echo -e "${RED}   ❌ Erro ao copiar certificados${NC}"
fi

echo ""

# 11. Tentar renovar certificados agora (se estiverem expirando)
echo "🔧 11. Tentando renovar certificados..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    EXPIRY_EPOCH=$(date -d "$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)" +%s)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -lt 30 ]; then
        echo "   Certificado expira em $DAYS_LEFT dias, tentando renovar..."
        if certbot renew --force-renewal --webroot -w "$PROJECT_DIR/certbot/www"; then
            echo -e "${GREEN}   ✅ Certificados renovados com sucesso${NC}"
            bash "$PROJECT_DIR/scripts/certbot-renewal-hook.sh"
        else
            echo -e "${RED}   ❌ Erro na renovação. Verifique os logs do certbot${NC}"
        fi
    else
        echo "   Certificado ainda válido por $DAYS_LEFT dias, não é necessário renovar agora"
        echo "   Use 'certbot renew --force-renewal' para forçar renovação"
    fi
fi

echo ""

# 12. Reiniciar containers
echo "🔧 12. Reiniciando containers Docker..."
cd "$PROJECT_DIR"
if docker compose ps | grep -q "biblioteca-frontend"; then
    docker compose restart frontend
    echo -e "${GREEN}   ✅ Container frontend reiniciado${NC}"
else
    echo -e "${YELLOW}   ⚠️  Container não está rodando${NC}"
fi

echo ""
echo "================================================"
echo "📊 RESUMO DA CONFIGURAÇÃO"
echo "================================================"
echo ""
echo "✅ Hooks de renovação configurados em: $HOOK_DIR"
echo "✅ Cronjobs configurados:"
echo "   - Certbot: 2h da manhã (renovação automática)"
echo "   - Cópia SSL: 3h da manhã (backup)"
echo "✅ Logs disponíveis em:"
echo "   - /var/log/ssl-copy.log"
echo "   - /var/log/ssl-renewal.log"
echo "   - /var/log/certbot-renew.log"
echo ""
echo "🔍 Comandos úteis:"
echo "   - Ver cronjobs: crontab -l"
echo "   - Testar renovação: certbot renew --dry-run"
echo "   - Forçar renovação: certbot renew --force-renewal"
echo "   - Copiar certificados: bash $PROJECT_DIR/scripts/copy-ssl-certs.sh"
echo "   - Ver logs SSL: tail -f /var/log/ssl-renewal.log"
echo "   - Ver logs certbot: tail -f /var/log/letsencrypt/letsencrypt.log"
echo ""
echo "================================================"
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "================================================"
