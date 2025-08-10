# Desenvolvimento Local com HTTPS

Este guia explica como rodar a aplicação localmente com HTTPS usando certificados auto-assinados.

## Problema Original

O problema estava ocorrendo porque:
1. **Você está rodando localmente** mas os certificados SSL reais estão na VPS
2. **O backend procura certificados em `/app/ssl/`** dentro do container Docker
3. **Localmente esses certificados não existem** ou não são válidos para `localhost`

## Solução para Desenvolvimento

### 1. Usar o Ambiente de Desenvolvimento

Execute o script automatizado:

```bash
./scripts/start-dev.sh
```

### 2. Ou Manualmente

#### Gerar Certificados Auto-assinados (se necessário):

```bash
mkdir -p ssl-dev
cd ssl-dev
openssl req -x509 -newkey rsa:4096 -keyout private.key -out certificate.crt -days 365 -nodes -subj "/C=BR/ST=State/L=City/O=Organization/CN=localhost"
cd ..
```

#### Rodar com Docker Compose de Desenvolvimento:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

## Acessos

- **Frontend HTTP**: http://localhost:3000
- **Frontend HTTPS**: https://localhost:3444 ⚠️ (aceitar certificado auto-assinado)
- **Backend HTTP**: http://localhost:3001  
- **Backend HTTPS**: https://localhost:3443 ⚠️ (aceitar certificado auto-assinado)

## Diferenças do Ambiente de Desenvolvimento

### `docker-compose.dev.yml`
- Usa porta `3000` para frontend (ao invés de `80`)
- Usa porta `3444` para HTTPS do frontend (ao invés de `443`)
- Mapeia `./ssl-dev` ao invés de `./ssl`
- Define `NODE_ENV=development`
- Remove certbot (não necessário localmente)

### `nginx.dev.conf`
- Configurado para `localhost`
- Permite HTTP e HTTPS
- Configuração SSL mais relaxada para desenvolvimento
- `proxy_ssl_verify off` para certificados auto-assinados

### `Dockerfile.dev`
- Usa `nginx.dev.conf` ao invés de `nginx.conf`

## Para Produção (VPS)

Continue usando o `docker-compose.yml` original que:
- Usa Let's Encrypt com certbot
- Configurado para o domínio real
- Redireciona HTTP para HTTPS
- Usa as portas padrão 80/443

## Comandos Úteis

```bash
# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar ambiente
docker-compose -f docker-compose.dev.yml down

# Reconstruir se fizer mudanças
docker-compose -f docker-compose.dev.yml up --build

# Ver status dos certificados
ls -la ssl-dev/
```

## Certificado Auto-assinado

Ao acessar `https://localhost:3444`, o navegador mostrará um aviso de segurança. Isso é normal para certificados auto-assinados. Para prosseguir:

- **Chrome/Edge**: Clique em "Avançado" → "Prosseguir para localhost (inseguro)"
- **Firefox**: Clique em "Avançado" → "Aceitar o risco e continuar"

## Estrutura de Arquivos

```
├── docker-compose.yml          # Produção (VPS)
├── docker-compose.dev.yml      # Desenvolvimento local
├── ssl/                        # Certificados reais (VPS)
├── ssl-dev/                    # Certificados auto-assinados (local)
├── frontend/
│   ├── nginx.conf              # Produção
│   ├── nginx.dev.conf          # Desenvolvimento
│   ├── Dockerfile              # Produção
│   └── Dockerfile.dev          # Desenvolvimento
└── scripts/
    └── start-dev.sh            # Script para iniciar desenvolvimento
```
