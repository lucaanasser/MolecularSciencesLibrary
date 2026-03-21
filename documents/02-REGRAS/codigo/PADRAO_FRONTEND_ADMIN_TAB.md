# Padrões de Desenvolvimento - Abas Admin

Este documento descreve os componentes e hooks padronizados para criação de abas no painel administrativo.

## Componentes Principais

### AdminTabRenderer

Componente que padroniza a renderização de abas que usam `ActionGrid`.

**Localização:** `@/features/admin/components/AdminTabRenderer`

**Uso básico:**

```tsx
import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import AddItemForm from "./features/AddItemForm";
import ItemList from "./features/ItemList";

const ManageItems = () => {
  return (
    <AdminTabRenderer
      title="Gerenciamento de Items"
      description="Adicione ou visualize items no sistema."
      actions={[
        { id: "add", label: "Adicionar item", color: "bg-cm-green" },
        { id: "list", label: "Ver lista", color: "bg-academic-blue" },
      ]}
      tabComponents={[
        { id: "add", component: AddItemForm },
        { id: "list", component: ItemList },
      ]}
      columns={2}
    />
  );
};
```

**Props:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | `string` | Título da seção (h3) |
| `description` | `string?` | Descrição da seção |
| `actions` | `AdminAction[]` | Lista de ações para o grid |
| `tabComponents` | `TabComponent[]` | Componentes mapeados por id |
| `columns` | `number?` | Colunas do grid (default: min(actions.length, 4)) |
| `loading` | `boolean?` | Estado de loading global |
| `defaultSuccessMessage` | `string?` | Mensagem padrão de sucesso |
| `onTabChange` | `(tabId: string \| null) => void?` | Callback de mudança de tab |
| `showHeaderOnTab` | `boolean?` | Mostrar título quando tab está selecionada |

### TabComponentProps

Interface padrão que todo componente de tab deve aceitar:

```tsx
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";

const MeuComponente: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  // ...
};
```

**Props padrão:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `onBack` | `() => void` | Volta para o grid de ações |
| `onSuccess` | `(message?: string) => void` | Exibe toast de sucesso e volta ao grid |
| `onError` | `(error: Error \| string) => void` | Exibe toast de erro |

### Props Customizadas

Para componentes que precisam de props adicionais, use a propriedade `props` em `tabComponents`:

```tsx
interface ItemListProps extends TabComponentProps {
  onExportCSV?: () => void;
}

// No ManageItems:
tabComponents={[
  { 
    id: "list", 
    component: ItemList, 
    props: { onExportCSV: handleExport } 
  },
]}
```

---

## Hook useAdminToast

Hook que padroniza mensagens de toast no painel admin.

**Localização:** `@/features/admin/hooks/useAdminToast`

**Uso:**

```tsx
import { useAdminToast } from "@/features/admin/hooks/useAdminToast";

const MeuComponente = () => {
  const { showSuccess, showError, showWarning, showInfo, showImportResult } = useAdminToast();

  const handleAction = async () => {
    try {
      await fazerAlgo();
      showSuccess("Operação concluída com sucesso!");
    } catch (err) {
      showError("Erro ao processar operação");
    }
  };

  // Para resultados de importação:
  showImportResult(10, 2, "usuários"); 
  // Exibe: "10 usuários importado(s) com sucesso, 2 falharam"

  // Para operações CRUD:
  showCrudResult("create", "Usuário"); // "Usuário adicionado com sucesso!"
  showCrudResult("delete", "Livro");   // "Livro removido com sucesso!"
};
```

**Métodos:**

| Método | Parâmetros | Descrição |
|--------|------------|-----------|
| `showSuccess` | `(message: string, title?: string)` | Toast de sucesso |
| `showError` | `(message: string, title?: string)` | Toast de erro (destructive) |
| `showWarning` | `(message: string, title?: string)` | Toast de aviso |
| `showInfo` | `(message: string, title?: string)` | Toast informativo |
| `showImportResult` | `(success: number, failed: number, entityName?: string)` | Resultado de importação |
| `showCrudResult` | `(operation, entityName, success?, customMessage?)` | Resultado de operação CRUD |

---

## Estrutura de Arquivos Recomendada

```
features/admin/features/minha-aba/
├── ManageMeuRecurso.tsx      # Usa AdminTabRenderer
└── features/
    ├── AddMeuRecursoForm.tsx  # Implementa TabComponentProps
    ├── MeuRecursoList.tsx     # Implementa TabComponentProps
    └── RemoveMeuRecurso.tsx   # Implementa TabComponentProps
```

---

## Cores Padrão

| Ação | Cor |
|------|-----|
| Adicionar | `bg-cm-green` |
| Remover | `bg-cm-red` |
| Ver lista | `bg-academic-blue` |
| Importar CSV | `bg-library-purple` |
| Uso interno | `bg-library-purple` |

---

## Exemplo Completo

```tsx
// ManageProducts.tsx
import AdminTabRenderer from "@/features/admin/components/AdminTabRenderer";
import AddProduct from "./features/AddProduct";
import ProductList from "./features/ProductList";
import RemoveProduct from "./features/RemoveProduct";

const ManageProducts = () => {
  return (
    <AdminTabRenderer
      title="Gerenciamento de Produtos"
      description="Adicione, remova ou visualize produtos."
      actions={[
        { id: "add", label: "Adicionar produto", color: "bg-cm-green" },
        { id: "remove", label: "Remover produto", color: "bg-cm-red" },
        { id: "list", label: "Ver todos", color: "bg-academic-blue" },
      ]}
      tabComponents={[
        { id: "add", component: AddProduct },
        { id: "remove", component: RemoveProduct },
        { id: "list", component: ProductList },
      ]}
    />
  );
};

// AddProduct.tsx
import type { TabComponentProps } from "@/features/admin/components/AdminTabRenderer";
import ActionBar from "@/features/admin/components/ActionBar";

const AddProduct: React.FC<TabComponentProps> = ({ onBack, onSuccess, onError }) => {
  const handleSubmit = async () => {
    try {
      await createProduct(data);
      onSuccess("Produto adicionado com sucesso!");
    } catch (err) {
      onError(err);
    }
  };

  return (
    <>
      {/* Formulário */}
      <ActionBar
        onConfirm={handleSubmit}
        onCancel={onBack}
        confirmLabel="Salvar"
      />
    </>
  );
};
```
