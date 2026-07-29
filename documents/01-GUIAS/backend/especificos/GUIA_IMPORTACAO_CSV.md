# Guia para Adicionar Novos Imports CSV

Este guia explica como adicionar novas funcionalidades de importação de dados via CSV, usando os módulos genéricos implementados no backend e frontend.

> **Produção roda no Worker (Cloudflare).** Use a seção "Worker" abaixo. A seção "Backend
> (Express — legado)" descreve o código do VPS, mantido só como referência.

## Worker

### 1. Utilitário genérico
- O utilitário está em `worker/src/csv.ts` (`escapeCSV`, `parseCSVLine`, `csvBody`,
  `csvDownload`, `csvUpload`, `parseCsv`, `insertRows`, `importResults`).
- Não existe multer: o arquivo vem de `csvUpload(c)`, que lê o campo `csvFile` do multipart.
- O contrato de resposta é o mesmo do Express: `{ success, failed, errors: [{ row, error, data }] }`.

### 2. Regra importante: nada de uma query por linha
Cada query D1 conta como *subrequest* e o plano free permite **50 por invocação**. Por isso o
fluxo é sempre:

1. `parseCsv` valida e mapeia **todas** as linhas em memória (sem tocar o banco);
2. uma ou duas queries de "pré-carga" trazem o que seria consultado por linha (ids existentes,
   e-mails já cadastrados, último código de cada subárea...) e as checagens acontecem em memória;
3. `insertRows` grava em lotes de 100 com `db.batch()` (1 subrequest por lote). Como `batch()` é
   transacional, o lote que falha é refeito linha a linha só para atribuir o erro à linha certa.

Exemplo (`worker/src/routes/donators.ts`):

```ts
const { mapped, errors: parseErrors } = parseCsv({ text, requiredFields, mapRow });
const { ready, errors: referenceErrors } = await checkDonatorReferences(c.env.DB, mapped);
const { inserted, errors: insertErrors } = await insertRows(c.env.DB, ready, (entity) => ({
  sql: 'INSERT INTO ... VALUES (?, ?)',
  params: [entity.a, entity.b]
}));
return c.json(importResults(inserted.length, parseErrors, referenceErrors, insertErrors), 200);
```

### 3. Diferença de banco: FK ligada
O SQLite do VPS rodava com foreign keys **desligadas** e aceitava referências quebradas; o D1
**sempre** valida. Toda coluna que referencia outra tabela precisa ser conferida na etapa 2.

### 4. E-mails em massa
Se a importação dispara e-mail por registro, use o endpoint `/emails/batch` do Resend
(1 subrequest por 100 mensagens), como `sendWelcomeEmailsBatch` em `worker/src/services/email.ts`.

## Backend (Express — legado)

### 1. Utilizar o utilitário genérico
- O utilitário está em `backend/src/utils/csvUtils.js`.
- Use a função `importFromCSV` no controller da entidade desejada.
- Exemplo:

```js
const { importFromCSV } = require('../utils/csvUtils');

async function importMinhaEntidadeFromCSV(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo CSV fornecido' });
  }
  const requiredFields = [/* campos obrigatórios */];
  const logger = { /* funções de log customizadas */ };
  const results = await importFromCSV({
    fileBuffer: req.file.buffer,
    requiredFields,
    mapRow: (rowData) => ({ /* mapeamento dos campos para objeto */ }),
    addFn: MinhaEntidadeService.add,
    logger
  });
  res.status(200).json(results);
}
```

### 2. Service
- O service deve receber o objeto já validado e mapeado.
- Não precisa se preocupar com parsing ou validação de CSV.

## Frontend

### 1. Usar o componente genérico
- O componente está em `frontend/src/features/common/CSVImportWizard.tsx`.
- Crie um componente para a entidade, usando o wizard:

```tsx
import CSVImportWizard from "@/features/common/CSVImportWizard";

export default function ImportMinhaEntidadeCSV({ onCancel, onSuccess, onError }) {
  return (
    <CSVImportWizard
      endpoint="/api/minhaentidade/import/csv"
      requiredFields={[/* campos obrigatórios */]}
      instructions={/* instruções customizadas */}
      onCancel={onCancel}
      onSuccess={onSuccess}
      onError={onError}
    />
  );
}
```

### 2. Instruções customizadas
- Passe instruções específicas para o usuário sobre o formato do CSV.

## Logs e Testes
- Siga o padrão de logs já usado nos controllers e componentes.
- Teste a importação com arquivos de exemplo e verifique os resultados e mensagens de erro.

## Dicas
- Centralize instruções e exemplos de CSV em `documents`.
- Compartimentalize a documentação de desenvolvimento em `documents/dev`.
- Para exportação, siga lógica semelhante usando funções utilitárias.

---

Se precisar adicionar novos imports, basta seguir este padrão e adaptar os campos e serviços conforme a entidade.