# Etapa de build do frontend
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
RUN cp public/sitemap.xml dist/sitemap.xml

# Etapa final com Nginx
FROM nginx:stable-alpine

# Atualizar pacotes de segurança e instalar ferramentas SSL
RUN apk upgrade --no-cache && \
	apk add --no-cache openssl ca-certificates && \
	update-ca-certificates

# Criar pastas necessárias
RUN mkdir -p /etc/letsencrypt/live/bibliotecamoleculares.com /var/www/certbot

# Copia os arquivos de build do frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a config do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o script de inicialização SSL
COPY --chmod=755 scripts/runtime/init-ssl.sh /usr/local/bin/init-ssl.sh

EXPOSE 80 443

CMD ["/usr/local/bin/init-ssl.sh"]
