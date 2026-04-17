#!/bin/sh

# ============================================================
# init-ssl.sh — Inicialização SSL do frontend
#
# Responsabilidades:
# 1. Verificar se os certificados Let's Encrypt existem e são válidos
# 2. Gerar certificados autoassinados temporários como fallback
# 3. Iniciar Nginx com reload periódico (pega certs renovados automaticamente)
# ============================================================

CERT_PATH="/etc/letsencrypt/live/bibliotecamoleculares.com/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/bibliotecamoleculares.com/privkey.pem"
SELF_SIGNED_DIR="/etc/letsencrypt/live/bibliotecamoleculares.com"

echo "🔵 [SSL] Verificando certificados..."

if [ -f "$CERT_PATH" ] && [ -f "$KEY_PATH" ]; then
    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2)

    if openssl x509 -in "$CERT_PATH" -checkend 0 -noout 2>/dev/null; then
        echo "✅ [SSL] Certificado Let's Encrypt válido (expira: $EXPIRY)"

        if ! openssl x509 -in "$CERT_PATH" -checkend 604800 -noout 2>/dev/null; then
            echo "⚠️  [SSL] Certificado expira em menos de 7 dias — o certbot deve renovar em breve"
        fi
    else
        echo "🔴 [SSL] Certificado EXPIRADO ($EXPIRY) — certbot deve renovar automaticamente"
        echo "🔴 [SSL] Se persistir, verifique os logs: docker compose logs certbot"
    fi
else
    echo "⚠️  [SSL] Certificados Let's Encrypt não encontrados"
    echo "⚠️  [SSL] Gerando certificados autoassinados temporários..."

    mkdir -p "$SELF_SIGNED_DIR"
    openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
        -keyout "$SELF_SIGNED_DIR/privkey.pem" \
        -out "$SELF_SIGNED_DIR/fullchain.pem" \
        -subj "/C=BR/ST=SP/L=SaoPaulo/O=BibliotecaCM/CN=bibliotecamoleculares.com" 2>/dev/null

    echo "⚠️  [SSL] Certificados autoassinados criados como fallback (30 dias)"
    echo "⚠️  [SSL] Obtenha certificados reais: sudo certbot certonly --webroot -w /var/www/certbot -d bibliotecamoleculares.com"
fi

# ----------------------------------------------------------
# Reload periódico do Nginx a cada 6 horas
# Quando o certbot renova os certificados, o Nginx precisa
# recarregá-los. Este loop garante isso automaticamente.
# ----------------------------------------------------------
(
    while :; do
        sleep 21600  # 6 horas
        echo "🔄 [SSL] Recarregando Nginx para verificar certificados atualizados..."
        nginx -s reload 2>/dev/null && echo "✅ [SSL] Nginx recarregado" || echo "⚠️  [SSL] Falha ao recarregar Nginx"
    done
) &

echo "🚀 [SSL] Iniciando Nginx..."
exec nginx -g "daemon off;"
