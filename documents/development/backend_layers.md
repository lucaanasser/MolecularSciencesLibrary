# Relação entre as camadas do backend

Este documento resume como as principais camadas do backend interagem entre si, com o banco de dados e com o frontend. Use este guia para entender onde modificar o código ao alterar funcionalidades ou dados.

---

## **Fluxo de uma requisição**

1. **Frontend** faz uma requisição HTTP (ex: POST `/api/loans/borrow`).
2. **Route** define o endpoint e direciona para o **Controller** correspondente.
3. **Controller** recebe a requisição, extrai dados, chama o **Service**.
4. **Service** aplica regras de negócio, validações e chama o **Model** para acessar/modificar o banco de dados.
5. **Model** executa queries no banco de dados (CRUD).
6. **Service** retorna o resultado para o **Controller**.
7. **Controller** envia a resposta para o **Frontend**.

---

## **Responsabilidades de cada camada**

- **Route:**  
  Define URLs e métodos HTTP.  
  Exemplo: `/api/loans/borrow` → `LoansController.borrowBook`.

- **Controller:**  
  Recebe requisições, valida dados básicos, chama o service, retorna resposta.  
  Exemplo: `LoansController.js`.

- **Service:**  
  Contém a lógica de negócio.  
  Aplica regras, validações, processa dados, chama o model.  
  Exemplo: `LoansService.js`.

- **Model:**  
  Representa entidades do banco de dados.  
  Executa queries e retorna dados.  
  Exemplo: `LoansModel.js`.

---

## **Onde modificar?**

- **Mudanças de regras de negócio:**  
  Altere o **Service**.

- **Mudanças de endpoints ou formato de resposta:**  
  Altere o **Controller** e/ou **Route**.

- **Mudanças na estrutura dos dados ou queries:**  
  Altere o **Model**.

- **Mudanças na interface ou consumo da API:**  
  Altere o **Frontend**.

---

## **Resumo visual**

```
Frontend <-> Route <-> Controller <-> Service <-> Model <-> Banco de Dados
```

---

**Dica:**  
Sempre verifique o tipo de dado retornado pelo backend para garantir compatibilidade com o frontend.