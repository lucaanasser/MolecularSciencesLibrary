# Biblioteca do CM

## Descrição
A Biblioteca do CM é um sistema web completo para gestão de biblioteca, incluindo cadastro de livros, usuários, empréstimos, notificações, controle de regras, prateleira virtual, doadores e badges. O sistema é composto por um backend em Node.js e um frontend moderno em React, com deploy facilitado via Docker.

## Estrutura do Projeto
```
BibliotecaCM/
├── backend/        # API Node.js (Express)
├── frontend/       # Aplicação web (React + Vite)
├── database/       # Banco de dados SQLite
├── scripts/        # Scripts utilitários e SSL
├── ssl/            # Certificados SSL
├── docker-compose.yml           # Ambiente de desenvolvimento
├── docker-compose.prod.yml      # Ambiente de produção
├── nginx-https.conf             # Configuração HTTPS para Nginx
```

## Tecnologias Utilizadas
- **Backend:** Node.js, Express, SQLite
- **Frontend:** React, Vite, TailwindCSS
- **Banco de Dados:** SQLite (pode ser migrado para outro SGBD)
- **Servidor Web:** Nginx (com suporte a HTTPS)
- **Containerização:** Docker e Docker Compose

## Funcionalidades Principais
- Cadastro e gerenciamento de livros, usuários, doadores e badges
- Controle de empréstimos e devoluções
- Notificações automáticas (incluindo atrasos)
- Prateleira virtual
- Importação de dados via CSV
- Interface web responsiva
- Suporte a HTTPS

## Requisitos para Hospedagem
- **CPU:** 1 vCPU ou superior
- **Memória RAM:** 1 GB mínimo (2 GB recomendado)
- **Armazenamento:** 1 GB livre (ajustável conforme volume de dados)
- **Banco de Dados:** SQLite local (ou suporte a outro SGBD, se migrado)
- **Docker:** Necessário para deploy simplificado
- **HTTPS:** Suporte a certificados SSL (já incluso na pasta `ssl/`)
- **Portas:** 80 (HTTP), 443 (HTTPS)

## Deploy e Execução
1. Clone o repositório
2. Configure os certificados SSL em `ssl/` (ou utilize os já existentes)
3. Execute `docker-compose -f docker-compose.prod.yml up -d` para subir o ambiente de produção
4. O frontend estará disponível via HTTPS na porta 443

## Observações para Cotação
- O sistema pode ser hospedado em VPS, cloud ou servidor dedicado
- Requer suporte a Docker e HTTPS
- O banco de dados padrão é SQLite, mas pode ser adaptado para MySQL/PostgreSQL
- O volume de acessos esperado e o crescimento do banco de dados podem influenciar os requisitos

Entre em contato para mais detalhes técnicos ou para customizações.
