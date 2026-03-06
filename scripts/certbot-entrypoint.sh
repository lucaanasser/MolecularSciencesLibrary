#!/bin/sh

# ============================================================
# certbot-entrypoint.sh — Renovação automática de certificados
#
# Este script roda dentro do container certbot e:
# 1. Espera o Nginx estar pronto (para servir ACME challenges)
# 2. Corrige a config de renovação se necessário (standalone → webroot)
# 3. Tenta renovar imediatamente na primeira execução
# 4. Entra em loop renovando a cada 12 horas
# ============================================================

DOMAIN="bibliotecamoleculares.com"
RENEWAL_CONF="/etc/letsencrypt/renewal/${DOMAIN}.conf"
WEBROOT="/var/www/certbot"

trap exit TERM

echo "=========================================="
echo "[certbot] Iniciando gerenciador de certificados SSL"
echo "[certbot] Domínio: $DOMAIN"
echo "=========================================="

# ----------------------------------------------------------
# 1. Esperar Nginx iniciar (precisa servir /.well-known/)
# ----------------------------------------------------------
echo "[certbot] Aguardando Nginx ficar pronto..."
sleep 15

# Verificar se o Nginx está respondendo na porta 80
for i in $(seq 1 10); do
    if wget -q --spider "http://frontend/.well-known/acme-challenge/" 2>/dev/null || \
       wget -q --spider "http://frontend:80/" 2>/dev/null; then
        echo "[certbot] ✅ Nginx está respondendo"
        break
    fi
    echo "[certbot] Tentativa $i/10 — aguardando Nginx..."
    sleep 5
done

# ----------------------------------------------------------
# 2. Corrigir config de renovação (standalone → webroot)
# ----------------------------------------------------------
if [ -f "$RENEWAL_CONF" ]; then
    echo "[certbot] Config de renovação encontrada: $RENEWAL_CONF"

    if grep -q "authenticator = standalone" "$RENEWAL_CONF"; then
        echo "[certbot] ⚠️  Authenticator configurado como 'standalone' — alterando para 'webroot'..."
        sed -i 's/authenticator = standalone/authenticator = webroot/' "$RENEWAL_CONF"

        # Adicionar webroot_path se não existe
        if ! grep -q "webroot_path" "$RENEWAL_CONF"; then
            sed -i "/\[renewalparams\]/a webroot_path = ${WEBROOT}," "$RENEWAL_CONF"
        fi

        # Adicionar/atualizar o webroot map
        if ! grep -q "\[\[webroot\]\]" "$RENEWAL_CONF"; then
            printf "\n[[webroot]]\n${DOMAIN} = ${WEBROOT}\nwww.${DOMAIN} = ${WEBROOT}\n" >> "$RENEWAL_CONF"
        fi

        echo "[certbot] ✅ Config atualizada para webroot"
    else
        echo "[certbot] ✅ Authenticator já está configurado corretamente"
    fi
else
    echo "[certbot] ⚠️  Nenhuma config de renovação encontrada"
    echo "[certbot] Tentando obter certificado pela primeira vez..."
    certbot certonly --webroot -w "$WEBROOT" \
        -d "$DOMAIN" -d "www.${DOMAIN}" \
        --non-interactive --agree-tos \
        --email "admin@${DOMAIN}" \
        --quiet || echo "[certbot] ❌ Falha ao obter certificado inicial"
fi

# ----------------------------------------------------------
# 3. Verificar estado atual do certificado
# ----------------------------------------------------------
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
if [ -f "$CERT_PATH" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2)

    if openssl x509 -in "$CERT_PATH" -checkend 0 -noout 2>/dev/null; then
        echo "[certbot] ✅ Certificado atual válido (expira: $EXPIRY)"
    else
        echo "[certbot] 🔴 Certificado EXPIRADO ($EXPIRY) — renovando agora..."
        certbot renew --force-renewal --quiet
        if [ $? -eq 0 ]; then
            NEW_EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2)
            echo "[certbot] ✅ Certificado renovado com sucesso! Nova expiração: $NEW_EXPIRY"
        else
            echo "[certbot] ❌ Falha na renovação. Verifique os logs: certbot renew --dry-run"
        fi
    fi
else
    echo "[certbot] ⚠️  Nenhum certificado encontrado em $CERT_PATH"
fi

# ----------------------------------------------------------
# 4. Loop de renovação (a cada 12 horas)
# ----------------------------------------------------------
echo "[certbot] Entrando no loop de renovação automática (a cada 12h)..."
echo "=========================================="

while :; do
    sleep 43200  # 12 horas
    echo "[certbot] $(date) — Verificando renovação..."
    certbot renew --quiet
    echo "[certbot] $(date) — Verificação concluída"
done
