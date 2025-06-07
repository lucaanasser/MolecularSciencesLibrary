# 📚 Biblioteca CM - Sistema de Gestão de Biblioteca

Sistema completo de gestão de biblioteca desenvolvido com React (frontend) e Node.js (backend), com suporte completo a HTTPS.

## 🔐 Configuração HTTPS

Este projeto suporta HTTPS tanto para desenvolvimento quanto para produção.

### 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- OpenSSL (para gerar certificados)

## 🚀 Início Rápido

### Desenvolvimento com HTTPS

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd BibliotecaCM
```

2. **Inicie com HTTPS (recomendado):**
```bash
./scripts/start-https.sh
```

Este script irá:
- Gerar certificados SSL automaticamente se não existirem
- Iniciar todos os serviços com Docker
- Configurar HTTPS no backend

3. **Acesse a aplicação:**
- 🌐 Frontend: http://localhost:8080
- 🔒 Backend HTTP: http://localhost:3001  
- 🔐 Backend HTTPS: https://localhost:3443

⚠️ **Nota:** Para HTTPS local, você precisará aceitar o certificado autoassinado no navegador.

### Desenvolvimento Manual

Se preferir iniciar manualmente:

```bash
# Gerar certificados SSL (se necessário)
./scripts/generate-ssl.sh

# Iniciar com Docker Compose
docker-compose up --build
```

## 🏭 Produção

Para produção, use o docker-compose específico:

```bash
# Produção com HTTPS
docker-compose -f docker-compose.prod.yml up --build
```

### Configuração de Produção

1. **Substitua os certificados SSL** em `./ssl/` pelos certificados válidos (Let's Encrypt recomendado)
2. **Configure o domínio** no arquivo `nginx-https.conf`
3. **Atualize as variáveis de ambiente** no `.env`

## 🔧 Configuração SSL

### Certificados Automáticos (Desenvolvimento)

O script `generate-ssl.sh` cria certificados autoassinados válidos por 365 dias:

```bash
./scripts/generate-ssl.sh
```

### Certificados de Produção

Para produção, substitua os arquivos em `./ssl/`:
- `private.key` - Chave privada
- `certificate.crt` - Certificado público
- `dhparam.pem` - Parâmetros Diffie-Hellman

## 🌐 URLs de Acesso

### Desenvolvimento
- Frontend: http://localhost:8080
- Backend HTTP: http://localhost:3001
- Backend HTTPS: https://localhost:3443

### Produção
- Frontend: https://seu-dominio.com
- API: https://seu-dominio.com/api

## 🔒 Segurança

O projeto implementa:
- ✅ HTTPS obrigatório em produção
- ✅ Redirecionamento HTTP → HTTPS
- ✅ Headers de segurança (HSTS, XSS Protection, etc.)
- ✅ Certificados SSL/TLS
- ✅ Configurações SSL seguras

## 🛠️ Comandos Úteis

```bash
# Gerar novos certificados SSL
./scripts/generate-ssl.sh

# Iniciar com HTTPS
./scripts/start-https.sh

# Desenvolvimento normal
docker-compose up

# Produção
docker-compose -f docker-compose.prod.yml up

# Verificar logs do backend
docker-compose logs backend

# Parar todos os serviços
docker-compose down
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
# Autenticação
ADMIN_PASSWORD=sua_senha_admin
PROALUNO_PASSWORD=sua_senha_proaluno

# SSL Configuration
SSL_KEY_PATH=../ssl/private.key
SSL_CERT_PATH=../ssl/certificate.crt
HTTPS_PORT=3443
HTTP_PORT=3001

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
```

## 🔧 Let's Encrypt (Produção)

Para configurar certificados gratuitos do Let's Encrypt:

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

🔐 **Projeto configurado com HTTPS para máxima segurança!**

