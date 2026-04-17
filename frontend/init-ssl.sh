#!/bin/sh

# Wrapper de compatibilidade: encaminha para o novo local do script.
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec /bin/sh "$SCRIPT_DIR/scripts/runtime/init-ssl.sh"
