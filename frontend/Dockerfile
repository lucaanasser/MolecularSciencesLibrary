# Etapa de build do frontend
FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install framer-motion
COPY . .
RUN npm run build
RUN cp public/sitemap.xml dist/sitemap.xml

# Etapa final com Nginx
FROM nginx:1.27-alpine

# Instalar openssl para gerar certificado autoassinado (fallback)
RUN apk add --no-cache openssl

# Criar pastas necessárias
RUN mkdir -p /etc/letsencrypt/live/bibliotecamoleculares.com /var/www/certbot

# Copia os arquivos de build do frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a config do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o script de inicialização SSL
COPY scripts/runtime/init-ssl.sh /usr/local/bin/init-ssl.sh
RUN chmod +x /usr/local/bin/init-ssl.sh

EXPOSE 80 443

CMD ["/usr/local/bin/init-ssl.sh"]
