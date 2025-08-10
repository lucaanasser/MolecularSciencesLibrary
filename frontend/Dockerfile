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

# Instalar openssl para gerar certificado
RUN apk add --no-cache openssl

# Criar pasta para certificados
RUN mkdir -p /etc/letsencrypt

# Copia os arquivos de build do frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a config do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
