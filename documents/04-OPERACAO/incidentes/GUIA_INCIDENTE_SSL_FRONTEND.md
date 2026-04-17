# RUNBOOK SSL FRONTEND

## Sintoma
Frontend nao sobe em HTTPS ou apresenta erro de certificado.

## Verificacoes rapidas
1. Conferir logs do container frontend.
2. Conferir logs do certbot.
3. Validar presenca de certificados em /etc/letsencrypt.

## Comandos uteis
- docker compose logs frontend
- docker compose logs certbot
- docker compose ps

## Possiveis causas
- certificado expirado
- certbot sem permissao/acesso ao webroot
- volume de certificados nao montado corretamente

## Acao de mitigacao
1. Garantir volume de certificados montado.
2. Reiniciar frontend para reload do Nginx.
3. Executar renovacao de certificado (quando aplicavel).

## Rollback
- restaurar ultima configuracao de compose/nginx funcional
- subir stack com configuracao anterior

## Pos-incidente
- registrar no template de post-mortem
- abrir issue para acao preventiva
