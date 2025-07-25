FROM node:23-slim

RUN apt-get update && \
    apt-get install -y sqlite3 ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app/database && \
    chmod 777 /app/database && \
    chown -R node:node /app/database

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

USER node

EXPOSE 3001 3443

CMD ["sh", "-c", "node src/database/initDb.js && node src/main.js"]