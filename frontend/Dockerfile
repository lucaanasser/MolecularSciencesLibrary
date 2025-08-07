# Dockerfile do frontend

FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install framer-motion
COPY . .
RUN npm run build
RUN cp public/sitemap.xml dist/sitemap.xml

FROM nginx:alpine

# Copia os arquivos de build
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
