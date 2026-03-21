# Guia para Adicionar Novos Imports CSV

Este guia explica como adicionar novas funcionalidades de importação de dados via CSV, usando os módulos genéricos implementados no backend e frontend.

## Backend

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