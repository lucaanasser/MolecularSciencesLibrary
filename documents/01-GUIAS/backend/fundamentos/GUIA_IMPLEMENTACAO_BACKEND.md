# GUIA DE EDICAO/MANUTENCAO BACKEND

## Objetivo
Este guia explica como editar e evoluir o backend com seguranca, mantendo o padrao arquitetural do projeto.

Use este documento quando for:
- criar uma nova feature
- refatorar um bloco existente
- modularizar arquivos grandes
- ajustar endpoints sem quebrar clientes

---

## Principios
1. Evolucao incremental: mudar em blocos pequenos.
2. Compatibilidade primeiro: nao quebrar endpoint na primeira entrega.
3. Coesao: cada arquivo deve ter responsabilidade clara.
4. Reuso: evitar duplicacao e extrair helper/modulo quando necessario.
5. Simplicidade: controller fino, service com regra, model com persistencia.

---

## Arquitetura Padrao
Fluxo de dependencia:
- routes -> controllers -> services -> models

Regras:
- Route nao chama service direto.
- Controller nao acessa model direto, salvo excecao documentada.
- Service concentra regra de negocio.
- Model concentra acesso ao banco.

Estrutura de pastas recomendada:
- backend/src/services/{dominio}/{feature}/{FeatureService}.js
- backend/src/services/{dominio}/{feature}/modules/*.js
- backend/src/controllers/{dominio}/{feature}/{FeatureController}.js
- backend/src/controllers/{dominio}/{feature}/handlers/*.js
- backend/src/routes/{dominio}/{FeatureRoutes}.js
- backend/src/routes/_shared/*.js

---

## Regra de Tamanho
- Meta por arquivo: ate 200 linhas.
- Em 180+ linhas: planejar quebra.
- Acima de 220 linhas: somente com justificativa explicita.

---

## Processo de Refatoracao por Bloco
Exemplo de bloco: books, users, reports, forum.

1. Diagnosticar
- listar endpoints atuais
- listar metodos publicos do service
- mapear dependencias cruzadas com outros blocos
- identificar riscos de quebra

2. Desenhar
- propor estrutura final de pastas/arquivos
- definir modulos internos
- definir quais endpoints serao novos
- definir quais endpoints legados ficam temporariamente

3. Implementar em etapas pequenas
- criar orquestrador do service
- mover regras para modulos
- simplificar controller
- ajustar rotas
- manter assinatura publica de metodos importantes

4. Validar
- sem erros nos arquivos alterados
- endpoints legados funcionando
- novos endpoints funcionando
- logs e respostas HTTP consistentes

5. Finalizar
- marcar legado como deprecated
- abrir tarefa futura para remocao de legado

---

## Compatibilidade e Deprecacao
Primeira entrega de um bloco:
- manter endpoint antigo funcionando
- endpoint antigo delega para fluxo novo
- criar endpoint novo com semantica correta

Deprecacao gradual:
- adicionar aviso de deprecated no endpoint antigo
- comunicar equipe
- monitorar uso
- remover apenas apos janela de migracao

Janela recomendada: 1 a 2 releases.

---

## Padronizacao Rigorosa de Logs
### Color code oficial (nao alterar)
- 🔵 inicio de operacao
- 🟢 sucesso/conclusao
- 🟡 aviso/fallback/fluxo alternativo
- 🔴 erro/falha

### Formato obrigatorio
Todo log deve seguir o formato:
`<EMOJI> [<Layer>] [<FileName>] [<FunctionName>] <mensagem> | <contexto-chave>`

Exemplos:
- `🔵 [UsersController] [UsersController.js] [createUser] Iniciando criacao de usuario | nusp=123456`
- `🟢 [BooksService] [booksManagement.js] [addBook] Livro criado | book_id=45`
- `🟡 [ReportsService] [consolidatedReports.js] [generateCompleteReport] Dados parciais por timeout | source=loans`
- `🔴 [NotificationsService] [coreNotification.js] [createNotification] Falha ao salvar notificacao | user_id=9 err=SQLITE_CONSTRAINT`

### Regras obrigatorias
- Sempre informar a camada no `Layer` (`Routes`, `Controller`, `Service`, `Model`).
- Sempre informar o arquivo real de origem (`FileName`).
- Sempre informar o metodo/funcao (`FunctionName`).
- Em erro, incluir `err.message` e IDs relevantes para rastreio.
- Nunca logar senha, token, hash, segredo ou payload sensivel.
- Evitar mensagens genéricas sem contexto.

### Deprecacao com log
Ao manter endpoint antigo por compatibilidade, logar aviso:
- `🟡 [BooksRoutes] [BooksRoutes.js] [GET /old-endpoint] Endpoint deprecated; usar GET /books/v2`

### Uso obrigatorio de snippets de logger
Nao usar `console.log/console.error` direto em codigo novo.

Usar modulo central:
- `backend/src/shared/logging/logger.js`

Exemplo pratico:
```js
const { getLogger } = require('../shared/logging/logger');

const log = getLogger(__filename);
log.start('Iniciando criacao de usuario', { nusp });

try {
	// fluxo principal
	log.success('Usuario criado', { user_id: created.id });
} catch (error) {
	log.error('Falha ao criar usuario', { err: error.message, nusp });
}
```

Checklist do snippet:
- usar `getLogger(__filename)` obrigatoriamente em codigo novo.
- preferir funcoes nomeadas para inferencia correta de `FunctionName`.
- incluir contexto util e nao sensivel.
- confiar no mascaramento automatico de chaves sensiveis, sem depender so disso.
- em erro, incluir `err.message`.

Fallback legado:
- `loggerSnippet(layer, file, fn)` apenas para compatibilidade de codigo antigo.

---

## Padrao Rigoroso de Comentarios

### Cabecalho de arquivo (obrigatorio)
Todo arquivo novo/refatorado deve iniciar com comentario geral contendo:
- responsabilidade do arquivo
- camada/escopo
- entradas e saidas esperadas
- dependencias relevantes

### Comentario por funcao (obrigatorio)
Cada funcao publica e cada funcao privada relevante deve conter comentario com:
- o que a funcao faz
- onde e usada
- quais outras funcoes/modulos ela chama
- efeitos colaterais importantes

### Template recomendado
```js
/**
 * O que faz: valida payload e delega criacao de emprestimo para o service.
 * Onde e usada: rota POST /loans.
 * Dependencias chamadas: LoansService.borrowBook, InputValidator.validateLoan.
 * Efeitos colaterais: persiste emprestimo e pode criar notificacao.
 */
async function borrowBookHandler(req, res) {
	// ...
}
```

### Regras de rigor
- comentario desatualizado e considerado erro de manutencao.
- proibido comentario vago (ex.: "faz coisas", "processa dados").
- ao alterar fluxo, atualizar comentario no mesmo commit.
- comentarios devem explicar intencao e integracao, nao apenas sintaxe.

---

## Warnings Criticos
1. Nao quebrar API publica sem plano de migracao.
2. Nao colocar regra de negocio no controller.
3. Nao duplicar codigo para ganhar velocidade.
4. Nao criar modulo generico sem coesao.
5. Nao misturar responsabilidades entre dominios sem orquestrador explicito.
6. Nao registrar erro sem arquivo e funcao de origem.
7. Nao quebrar o padrao de color code (🔵 🟢 🟡 🔴).

---

## Checklist Antes de Merge
- [ ] Arquivos alterados com tamanho dentro do padrao
- [ ] Sem duplicacao evidente de regra
- [ ] Camadas respeitadas (route/controller/service/model)
- [ ] Compatibilidade mantida na primeira entrega
- [ ] Deprecated marcado quando aplicavel
- [ ] Logs seguem formato obrigatorio (Layer + FileName + FunctionName)
- [ ] Snippets de logger automaticos aplicados (`getLogger(__filename)`)
- [ ] Color code oficial de logs mantido
- [ ] Arquivos possuem cabecalho descritivo atualizado
- [ ] Funcoes possuem comentarios obrigatorios (uso + dependencias + efeito)
- [ ] Erros do workspace resolvidos
- [ ] Fluxos principais testados

---

Fim.
