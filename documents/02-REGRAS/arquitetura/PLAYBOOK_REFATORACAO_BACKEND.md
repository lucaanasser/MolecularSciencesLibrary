# PLAYBOOK DE REFATORACAO BACKEND (PARA IA)

## 1) Objetivo
Este documento define um padrao unico para refatorar backend por blocos (library, utilities, academic), sem quebrar funcionamento existente, com foco em:
- modularizacao
- reutilizacao maxima
- baixo acoplamento
- manutencao facil
- limite de tamanho por arquivo

Use este playbook como regra principal durante toda a refatoracao.

---

## 2) Regra Global de Tamanho
- Alvo: ate 200 linhas por arquivo.
- Gatilho de quebra: 180 linhas.
- Tolerancia maxima temporaria: 220 linhas (somente com justificativa no PR).

Se um arquivo passar de 180 linhas, quebrar em modulos/handlers no mesmo ciclo.

---

## 3) Arquitetura Padrao (obrigatoria)
### 3.1 Camadas
Fluxo obrigatorio de dependencia:
- routes -> controllers -> services -> models

Regras:
- route NAO chama service diretamente.
- controller NAO acessa model diretamente (salvo excecao documentada).
- service concentra regra de negocio e orquestracao.
- model concentra persistencia.

### 3.2 Estrutura de diretorios (template)
- `backend/src/services/{dominio}/{feature}/{FeatureService}.js`
- `backend/src/services/{dominio}/{feature}/modules/{featurePart}.js`
- `backend/src/controllers/{dominio}/{feature}/{FeatureController}.js`
- `backend/src/controllers/{dominio}/{feature}/handlers/{useCase}.js`
- `backend/src/routes/{dominio}/{FeatureRoutes}.js`
- `backend/src/routes/_shared/{middleware}.js`

### 3.3 Responsabilidade por camada
- Route:
  - declarar endpoint
  - aplicar middleware
  - chamar controller
- Controller:
  - validar entrada basica
  - traduzir para HTTP status
  - delegar regra de negocio para service
- Service:
  - regras de negocio
  - orquestracao entre modulos
  - integracao com outros services quando necessario
- Model:
  - queries e acesso ao banco

---

## 4) Padrao de Service Modular
### 4.1 Orquestrador
Arquivo principal pequeno (40-80 linhas), somente composicao de modulos.

Exemplo de padrao:
```js
const partA = require('./modules/partA');
const partB = require('./modules/partB');

class FeatureService {}

Object.assign(
  FeatureService.prototype,
  partA,
  partB
);

module.exports = new FeatureService();
```

### 4.2 Modulos
Cada modulo com um subdominio da regra (50-200 linhas):
- `queries`
- `management`
- `validation`
- `import`
- `workflow`

Nao duplicar regra em modulos diferentes. Extrair helper compartilhado quando necessario.

---

## 5) Compatibilidade na Primeira Entrega (obrigatorio)
### 5.1 O que significa
Na primeira entrega de cada bloco:
- Nao remover endpoint antigo.
- Endpoint antigo continua funcionando.
- Endpoint antigo delega para fluxo novo internamente.

### 5.2 Deprecacao gradual
- Marcar endpoint antigo como deprecated (comentario + log de aviso).
- Criar endpoint novo com semantica correta.
- Monitorar uso do endpoint antigo.
- Remover endpoint antigo somente apos janela de migracao.

Janela recomendada: 1 a 2 ciclos de release.

---

## 6) Regras para Evitar Acoplamento Entre Blocos
### 6.1 Fronteiras de dominio
- library: regras de livros, emprestimos, usuarios, etc.
- utilities: email, notificacoes, relatorios, regras globais, helpers.
- academic: forum, disciplinas, perfis academicos.

### 6.2 Regras praticas
- Evitar que controller de um bloco implemente regra de negocio de outro.
- Se fluxo cruza dominios, criar service de orquestracao explicito.
- Nao usar import dinamico dentro de metodo (`require` dentro de handler), salvo excecao tecnica documentada.
- Nao usar model de outro dominio diretamente quando houver service/facade apropriado.

### 6.3 Quando extrair facade/orquestrador
Extrair quando houver qualquer um:
- controller chamando 3 ou mais services de dominios diferentes
- regra de negocio com condicoes cruzadas entre blocos
- duplicacao do mesmo fluxo em mais de um controller

---

## 6.4) Padrao Rigoroso de Logs (obrigatorio)
### Color code oficial (manter sem alteracoes)
- 🔵 inicio de operacao/etapa
- 🟢 sucesso/conclusao
- 🟡 aviso, fallback ou fluxo alternativo
- 🔴 erro/falha

### Formato obrigatorio
Todo log deve identificar explicitamente origem e contexto:
`<EMOJI> [<Layer>] [<FileName>] [<FunctionName>] <mensagem> | <contexto-chave>`

Exemplo:
- `🔵 [BooksService] [booksImport.js] [importFromCsv] Iniciando importacao | file=livros.csv`
- `🟢 [BooksController] [BooksController.js] [createBook] Livro criado com sucesso | book_id=123`
- `🟡 [NotificationsService] [overdueNotification.js] [createOverdueReminderIfDue] Reminder ignorado por cooldown | loan_id=88`
- `🔴 [LoansService] [loanBorrow.js] [_borrowBookCore] Erro ao criar emprestimo | user_id=7 book_id=20 err=SQLITE_BUSY`

### Regras obrigatorias
- Sempre incluir nome da camada (`Controller`, `Service`, `Model` ou `Routes`) no campo `Layer`.
- Sempre incluir nome do arquivo de origem no log (`FileName`).
- Sempre incluir nome da funcao/metodo (`FunctionName`).
- Em logs de erro, incluir `err.message` e, quando seguro, IDs de contexto (`user_id`, `book_id`, `loan_id`).
- Nao logar dados sensiveis: senha, token, hash, payload de credenciais.
- Nao criar logs vagos como `Erro inesperado` sem contexto minimo.
- Em endpoints deprecated, emitir log de aviso com 🔵 ou 🟡 indicando rota antiga e substituta.

### Regras por camada
- Routes:
  - logar entrada de rota e encaminhamento para controller.
  - exemplo: `🔵 [NotificationsRoutes] [NotificationsRoutes.js] [POST /nudge] Encaminhando requisicao para NotificationsController.createNotification`
- Controllers:
  - logar inicio do handler, validacoes falhas e resposta final (sucesso/erro).
- Services:
  - logar inicio de operacao, pontos de decisao importantes e resultado final.
- Models:
  - logar apenas em falhas relevantes de persistencia (evitar ruido de query normal).

### Implementacao obrigatoria com snippets de logger
Nao escrever `console.log/console.error` diretamente em codigo novo.

Usar sempre os snippets de:
- `backend/src/shared/logging/logger.js`

Padrao:
```js
const { getLogger } = require('../shared/logging/logger');
const log = getLogger(__filename);

log.start('Iniciando criacao de livro', { title });
log.success('Livro criado', { book_id: newBook.id });
log.warn('Livro ja existente, seguindo com atualizacao', { isbn });
log.error('Falha ao persistir livro', { err: error.message, isbn });
```

Regras:
- `Layer` e `FileName` sao inferidos automaticamente por `__filename`.
- `FunctionName` e inferido automaticamente via stack trace.
- em scripts, preferir funcoes nomeadas (evitar fluxo em escopo anonimo).
- contexto deve carregar apenas dados de rastreio (IDs e campos nao sensiveis).
- chaves sensiveis (`password`, `token`, `secret`, `authorization`, `cookie`, `hash`) sao mascaradas automaticamente.
- proibido logar credenciais, token, hash, senha, cookie ou payload sensivel.

Fallback legado (somente compatibilidade):
- `loggerSnippet(layer, file, fn)`
- permitido apenas quando houver limitacao tecnica comprovada no modo automatico.

### Padrao de deprecacao em log
Quando endpoint legado for mantido por compatibilidade:
- `🟡 [NotificationsRoutes] [NotificationsRoutes.js] [POST /] Endpoint deprecated em uso; migrar para POST /notifications/v2`

---

## 6.5) Padrao Rigoroso de Comentarios (obrigatorio)
Todo arquivo de codigo novo/refatorado deve seguir os niveis abaixo.

### Comentario de cabecalho do arquivo (obrigatorio)
No topo do arquivo, incluir comentario geral com:
- responsabilidade do arquivo
- fronteira da camada (route/controller/service/model/shared/script)
- entradas/saidas principais
- dependencias criticas

### Comentario por funcao/metodo (obrigatorio)
Antes de cada funcao publica e funcao privada relevante, descrever:
- o que a funcao faz (1-2 frases)
- onde e usada (modulo/camada chamadora)
- quais funcoes/servicos ela chama
- pre-condicoes e efeitos colaterais importantes

### Regras de estilo
- comentarios curtos, objetivos e tecnicos.
- nao repetir literalmente o que a linha de codigo ja mostra.
- manter comentario sincronizado com comportamento atual.
- se alterar assinatura ou fluxo, atualizar comentario no mesmo commit.

### Template minimo de funcao
```js
/**
 * O que faz: cria notificacao de atraso e registra evento de auditoria.
 * Onde e usada: NotificationsController.createNotification e checkOverdues.js.
 * Dependencias chamadas: NotificationsModel.create, AuditService.register.
 * Efeitos colaterais: persiste em DB e pode disparar integracao externa.
 */
async function createOverdueNotification(input) {
  // ...
}
```

---

## 7) Processo Obrigatorio por Bloco (passo a passo)
Para cada bloco (ex.: books, users, reports, forum):

1. Diagnostico
- mapear endpoints atuais
- mapear metodos publicos do service atual
- mapear dependencias cruzadas
- listar riscos de quebra

2. Desenho
- definir estrutura de pastas final
- definir modulos internos
- definir endpoints novos (se houver)
- definir plano de compatibilidade/deprecacao

3. Implementacao incremental
- criar orquestrador + modulos
- mover regra de negocio para modulos
- manter assinatura publica
- reduzir controller para fachada HTTP
- ajustar rotas mantendo endpoint legado

4. Validacao
- sem erros de analise nos arquivos alterados
- metodos publicos preservados
- endpoints antigos funcionando
- endpoints novos funcionando
- logs de deprecacao ativos

5. Limpeza (fase posterior)
- remover wrappers legados somente apos janela de migracao
- remover endpoint deprecated somente apos evidencias de nao uso

---

## 8) Checklist de Qualidade (obrigatorio em toda entrega)
- [ ] Nenhum arquivo novo/alterado acima de 220 linhas
- [ ] Controller sem regra de negocio complexa
- [ ] Sem duplicacao de codigo entre modulos
- [ ] Reuso maximo de helpers/utilitarios
- [ ] Sem import dinamico em metodos
- [ ] Sem route chamando service direto
- [ ] Compatibilidade garantida para endpoints legados (primeira entrega)
- [ ] Endpoint antigo marcado como deprecated quando existir endpoint novo
- [ ] Logs padronizados por camada
- [ ] Logs com origem completa (Layer + FileName + FunctionName)
- [ ] Color code de logs respeitado (🔵 🟢 🟡 🔴)
- [ ] Erros de workspace resolvidos nos arquivos alterados

---

## 9) Warnings Criticos
1. Nao quebrar API na primeira entrega do bloco.
2. Nao mover tudo de uma vez sem checkpoints.
3. Nao duplicar regra so para "terminar rapido".
4. Nao misturar regra de dominio em controller.
5. Nao criar modulo sem coesao (arquivo "misc").
6. Nao esconder acoplamento com wrappers infinitos.
7. Nao remover legado sem janela de deprecacao.
8. Nao registrar erro sem informar arquivo e funcao de origem.
9. Nao alterar o color code padrao de logs.

---

## 10) Ordem Recomendada de Refatoracao (risco menor -> maior)
1. notifications + email (separar responsabilidades e rotas)
2. books
3. reports
4. users
5. forum/perfis (apos estabilizar contratos cruzados)

Observacao: se no diagnostico aparecer dependencia critica, ajustar ordem antes de implementar.

---

## 11) Prompt Padrao para usar com IA
Use este modelo no chat:

"Leia o arquivo PLAYBOOK_REFATORACAO_BACKEND.md e siga a risca.
Agora refatore o bloco {NOME_DO_BLOCO}.
Regras obrigatorias:
- manter compatibilidade de endpoints na primeira entrega
- marcar endpoints mistos/legados para deprecacao gradual
- nao duplicar codigo
- maximizar reuso
- respeitar limite de tamanho por arquivo
- aplicar exatamente a arquitetura e checklist do playbook
Antes de codar, me entregue:
1) diagnostico do bloco
2) estrutura final proposta
3) plano incremental em fases pequenas
Depois implemente fase a fase, validando a cada fase." 

---

## 12) Resultado Esperado de Cada Refatoracao
Ao final de cada bloco, deve existir:
- arquitetura modular consistente com este playbook
- codigo mais curto e coeso
- menos acoplamento entre dominios
- compatibilidade preservada na primeira entrega
- caminho claro para remover legados depois

Fim do documento.
