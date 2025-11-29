#!/bin/bash

# Script de renovação automática de certificados SSL
# Este script para o frontend, renova os certificados, copia e reinicia
# Projetado para rodar automaticamente via cronjob

set -e

PROJECT_DIR="/root/MolecularSciencesLibrary"
DOMAIN="bibliotecamoleculares.com"
LOG_FILE="/var/log/ssl-auto-renew.log"

# Função para log com timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "🔵 Iniciando renovação automática de SSL"
log "=========================================="

# Verificar se precisa renovar (menos de 30 dias)
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    EXPIRY_EPOCH=$(date -d "$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)" +%s 2>/dev/null || echo 0)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
    
    log "📅 Certificado atual expira em $DAYS_LEFT dias"
    
    # Se ainda tem mais de 30 dias, não faz nada
    if [ $DAYS_LEFT -gt 30 ]; then
        log "✅ Certificado ainda válido por $DAYS_LEFT dias. Nenhuma ação necessária."
        log "=========================================="
        exit 0
    fi
    
    log "⚠️  Certificado precisa ser renovado (menos de 30 dias ou expirado)"
else
    log "❌ Certificado não encontrado. Tentando renovar..."
fi

# Navegar para diretório do projeto
cd "$PROJECT_DIR" || {
    log "❌ Erro: Diretório do projeto não encontrado"
    exit 1
}

# 1. Parar containers que usam as portas 80 e 443
log "🔄 Parando containers frontend e certbot..."
docker compose stop frontend certbot 2>&1 | tee -a "$LOG_FILE"
sleep 5

# 2. Renovar certificados com standalone
log "🔐 Renovando certificados com certbot standalone..."
if certbot renew --standalone --non-interactive --agree-tos 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Certificados renovados com sucesso"
else
    # Se falhar renovação normal, forçar
    log "⚠️  Renovação normal falhou, forçando renovação..."
    if certbot certonly --standalone --force-renewal --non-interactive --agree-tos -d "$DOMAIN" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Certificados renovados (forçado) com sucesso"
    else
        log "❌ Erro ao renovar certificados"
        # Subir containers mesmo com erro
        docker compose up -d 2>&1 | tee -a "$LOG_FILE"
        exit 1
    fi
fi

# 3. Copiar certificados para pasta do projeto
log "📋 Copiando certificados para pasta do projeto..."
if bash "$PROJECT_DIR/scripts/copy-ssl-certs.sh" 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Certificados copiados com sucesso"
else
    log "❌ Erro ao copiar certificados"
fi

# 4. Subir containers novamente
log "🚀 Reiniciando containers..."
docker compose up -d 2>&1 | tee -a "$LOG_FILE"
sleep 10

# 5. Verificar se tudo está funcionando
log "🔍 Verificando status dos containers..."
docker compose ps | tee -a "$LOG_FILE"

# 6. Verificar novo certificado
if [ -f "$PROJECT_DIR/ssl/certificate.crt" ]; then
    NEW_EXPIRY=$(openssl x509 -enddate -noout -in "$PROJECT_DIR/ssl/certificate.crt" | cut -d= -f2)
    log "📅 Novo certificado válido até: $NEW_EXPIRY"
    
    # Calcular novos dias restantes
    NEW_EXPIRY_EPOCH=$(date -d "$NEW_EXPIRY" +%s)
    NEW_DAYS_LEFT=$(( ($NEW_EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))
    log "✅ Certificado renovado com sucesso! Válido por mais $NEW_DAYS_LEFT dias"
else
    log "⚠️  Certificado não encontrado após renovação"
fi

log "=========================================="
log "✅ Renovação automática concluída"
log "=========================================="

exit 0
