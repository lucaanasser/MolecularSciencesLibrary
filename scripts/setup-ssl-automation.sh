#!/bin/bash

# Script para configurar automação completa dos certificados SSL

echo "🔵 Configurando automação dos certificados SSL..."

PROJECT_DIR="/root/MolecularSciencesLibrary"
SCRIPTS_DIR="$PROJECT_DIR/scripts"

# 1. Tornar scripts executáveis
chmod +x "$SCRIPTS_DIR/copy-ssl-certs.sh"
chmod +x "$SCRIPTS_DIR/certbot-renewal-hook.sh"
echo "✅ Permissões de execução configuradas"

# 2. Configurar hook do certbot no sistema
CERTBOT_HOOK_DIR="/etc/letsencrypt/renewal-hooks/deploy"
mkdir -p "$CERTBOT_HOOK_DIR"

# Criar link simbólico para o hook no diretório do certbot
if [ ! -L "$CERTBOT_HOOK_DIR/copy-ssl-certs.sh" ]; then
    ln -sf "$SCRIPTS_DIR/certbot-renewal-hook.sh" "$CERTBOT_HOOK_DIR/copy-ssl-certs.sh"
    echo "✅ Hook de renovação configurado no certbot"
else
    echo "ℹ️  Hook de renovação já configurado"
fi

# 3. Criar cronjob como backup (caso o certbot falhe)
CRON_JOB="0 3 * * * $SCRIPTS_DIR/copy-ssl-certs.sh >> /var/log/ssl-copy.log 2>&1"

if ! crontab -l 2>/dev/null | grep -q "copy-ssl-certs.sh"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Cronjob de backup adicionado (3h da manhã)"
else
    echo "ℹ️  Cronjob já existe"
fi

# 4. Criar arquivo de log
touch /var/log/ssl-copy.log
echo "✅ Arquivo de log criado: /var/log/ssl-copy.log"

# 5. Testar o script de cópia
echo ""
echo "🧪 Testando script de cópia..."
"$SCRIPTS_DIR/copy-ssl-certs.sh"

echo ""
echo "📋 CONFIGURAÇÃO COMPLETA:"
echo "✅ Hook do certbot: Executará automaticamente após renovação"
echo "✅ Cronjob backup: Executará diariamente às 3h da manhã"
echo "✅ Container certbot: Verificará renovação diariamente"
echo ""
echo "🔧 Comandos úteis:"
echo "   Ver logs: tail -f /var/log/ssl-copy.log"
echo "   Testar hook: $SCRIPTS_DIR/certbot-renewal-hook.sh"
echo "   Testar cópia: $SCRIPTS_DIR/copy-ssl-certs.sh"
echo "   Ver cronjobs: crontab -l"
