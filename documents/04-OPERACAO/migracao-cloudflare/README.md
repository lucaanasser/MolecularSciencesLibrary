# operacao/migracao-cloudflare

Inventario do sistema legado (backend Express + SQLite) capturado antes da
migracao para Cloudflare Workers + D1. Serve de linha de base para conferir que
nada ficou para tras durante o port.

Nao e guia de leitura: e material de consulta e conferencia.

## Arquivos

- `rotas-cruas.txt` - as 224 rotas do backend Express no momento do inventario.
  Use como checklist do que ainda falta portar para `worker/src/routes/`.
- `baseline-counts.txt` - contagem de linhas por tabela antes da migracao.
  Compare com o D1 depois do import para validar paridade.
- `schema-atual.sql` - schema SQLite antigo. Referencia ao escrever migrations
  em `worker/migrations/`.
- `env-vars.txt` - variaveis de ambiente lidas no codigo legado. Checklist dos
  secrets a configurar no Cloudflare.
- `dados.sql` - dump de dados reais. **Fora do Git** (contem e-mails e hashes de
  senha); a regra esta no `.gitignore`. Nunca commitar.

## Ciclo de vida

Estes arquivos sao descartaveis. Quando a migracao terminar, o worker passa a
ser a fonte da verdade e `rotas-cruas`, `schema-atual` e `env-vars` perdem o
valor. Mover entao o que sobrar (basicamente `baseline-counts.txt`, como
registro da conferencia) para `05-HISTORICO/migracoes-concluidas/`.
