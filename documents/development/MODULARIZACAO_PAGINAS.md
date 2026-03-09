# Modularização de BookPage e DisciplinePage

**Data:** 08/03/2026

---

## O que foi feito

### Novos arquivos criados em `features/`

#### `features/result-page/`
- **`PageLoadingState.tsx`** — Spinner centralizado reutilizável para estados de carregamento de página. Aceita prop `color`.
- **`PageErrorState.tsx`** — Tela de erro centralizada com ícone `AlertCircle`, mensagem e botão "Voltar" opcional.
- `index.ts` atualizado para exportar os dois novos componentes.

#### `features/rating/`
- **`EvaluationsTab.tsx`** — Componente que encapsula o bloco `EvaluationForm + EvaluationsList`, eliminando a repetição do mesmo padrão em todas as páginas que usam avaliações. Recebe `evalState`, `criterios`, `accentColor`, `placeholder` e `emptyMessage`.
- `index.ts` atualizado para exportar `EvaluationsTab`.

#### `features/library-book/` *(novo)*
Extrai toda a lógica específica de livros para fora de `BookPage.tsx`.

| Arquivo | Responsabilidade |
|---|---|
| `useBookPage.ts` | Hook que carrega os exemplares por código e os empréstimos ativos de cada um |
| `bookEvalConfig.ts` | Constantes `BOOK_INITIAL_RATINGS`, `BOOK_CRITERIOS_FORM`, `BOOK_CRITERIOS_CARD` |
| `ExemplarsList.tsx` | Tabela (desktop) + cards (mobile) de exemplares com status, devolução e NudgeButton |
| `BookInfoSection.tsx` | Seção de informações do livro (autores, área, subárea, idioma, doador) + `ExemplarsList` |
| `index.ts` | Barrel de exportações |

#### `features/discipline-page/` *(novo)*
Extrai a lógica específica de disciplinas para fora de `DisciplinePage.tsx`.

| Arquivo | Responsabilidade |
|---|---|
| `useDisciplinePage.ts` | Hook que carrega a disciplina completa por código |
| `disciplineEvalConfig.ts` | Constantes `DISC_INITIAL_RATINGS`, `DISC_CRITERIOS_FORM`, `DISC_CRITERIOS_CARD` |
| `DisciplineInfoSection.tsx` | Seção de ementa, objetivos e conteúdo programático (com animações `framer-motion`) |
| `DisciplineHeader.tsx` | Badges de código/tipo, nome, créditos — parte do cabeçalho da disciplina |
| `index.ts` | Barrel de exportações |

### Componentes existentes aprimorados

- **`lib/TabsCard.tsx`** — `TabDefinition` agora aceita prop opcional `badge: (isActive: boolean) => React.ReactNode` para renderizar badges nas tabs (ex: contador de avaliações).
- **`features/result-page/ResultPage.tsx`** — Nova prop opcional `iconBgColor` para separar a cor do ícone (ex: `purple-600` para pós-grad) da cor de destaque das tabs (`highlightColor`).

### Páginas refatoradas

#### `pages/library/BookPage.tsx`
- De ~470 linhas → **~185 linhas**
- Removidos: gerenciamento de estado de carregamento inline, helpers `getReturnInfo`/`formatDonator`, toda a JSX de exemplares (desktop + mobile), blocos inline de `EvaluationForm` e `EvaluationsList`
- Passou a usar: `useBookPage`, `BookInfoSection`, `EvaluationsTab`, `PageLoadingState`, `PageErrorState`

#### `pages/academic/DisciplinePage.tsx`
- De ~430 linhas → **~196 linhas**
- Removidos: gerenciamento de estado de carregamento inline, header inline, blocos de `motion.div` de ementa/objetivos/conteúdo, tabs manuais com `cn()`, layout de sidebar + TabsCard repetidos, blocos de `EvaluationForm` e `EvaluationsList`
- Passou a usar: `useDisciplinePage`, `DisciplineHeader`, `DisciplineInfoSection`, `EvaluationsTab`, `PageLoadingState`, `PageErrorState`, `ResultPage`

---

## O que ainda pode ser feito

### Alta prioridade

- [x] **`features/_disciplines/DisciplinesSearchProps.tsx`** — Criado. Exportado como `searchProps` via `_disciplines/index.ts`. Usa `searchDisciplines` do `DisciplinesService`, rota de resultados `/academico/buscar/resultados` e rota de disciplina `/academico/disciplina/:codigo`.
- [x] **`features/_disciplines/DisciplinesSearchResultsProps.tsx`** — Criado. Exportado como `searchResultsProps`. Usa `getDisciplines` como serviço de resultados, com campos `nome` (main, com link), `codigo`, `unidade` e `campus`.
- [x] **`pages/academic/AcademicSearchPage.tsx`** — Implementado com `SearchPage` usando `searchProps` de `_disciplines`.
- [x] **`pages/academic/AcademicSearchResultsPage.tsx`** — Implementado com `SearchResultsPage` usando `searchResultsProps` de `_disciplines`.
- [x] **`pages/academic/AcademicUserSearchResultsPage.tsx`** — Sintaxe quebrada corrigida (stub com `return <></>`).
- [ ] **Testar as duas páginas no browser** — Verificar que `BookPage` e `DisciplinePage` renderizam corretamente após o refactor, especialmente os estados de loading/erro e a troca de abas.

### Média prioridade

- [ ] **Outras páginas que usam `EvaluationForm` + `EvaluationsList` inline** — Se existirem outras páginas com o mesmo padrão, migrar para `EvaluationsTab`.
- [ ] **`useBookPage` — tratamento de erro mais granular** — Atualmente exibe mensagem genérica se `getLoansByBook` falhar; poderia distinguir erro de rede de livro não encontrado.
- [ ] **`DisciplinePage` — badge de avaliações na tab** — Já implementado via `TabDefinition.badge`, mas depende de `TabsCard` renderizar corretamente em mobile (verificar layout).
- [ ] **`ResultPage` — prop `onBack` com `navigate(-1)` vs rota fixa** — `BookPage` usa `navigate(-1)` e `DisciplinePage` usa `/academico/buscar`. Considerar padronizar ou documentar a escolha.

### Baixa prioridade

- [ ] **Extrair `useEvaluationsConfig` para cada domínio** — As configs de `useEvaluations` (callbacks de `createEval`, `updateEval`, `parseFormRatings`) ainda ficam nas páginas. Poderiam virar hooks dedicados `useBookEvaluations(bookId)` e `useDisciplineEvaluations(codigo)` para deixar as páginas ainda menores.
- [ ] **Storybook / testes unitários** — Os componentes extraídos (`ExemplarsList`, `BookInfoSection`, `DisciplineInfoSection`, `EvaluationsTab`) são bons candidatos para testes isolados.
- [ ] **`features/result-page/useGenericEvaluation.ts`** — Hook legado que pode ser removido se nenhuma página ainda o usar.
