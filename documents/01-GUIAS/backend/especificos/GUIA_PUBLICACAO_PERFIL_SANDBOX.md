# GUIA DE IMPLEMENTACAO: PUBLICACAO DE PERFIL NO SANDBOX

## Objetivo
Implementar a publicacao de perfis publicos da BibliotecaCM para o repositorio sandbox do site publico (ccm-website-public-sandbox), com fluxo seguro, reutilizacao maxima de codigo existente e aderencia aos padroes do projeto.

Este guia documenta o plano e a implementacao inicial ja iniciada no codigo.

---

## Escopo do MVP (fase atual)
1. Transformar perfil interno para schema de dados do site publico.
2. Publicar no repositorio sandbox via GitHub App.
3. Criar branch, commit, push e PR automaticamente.
4. Expor endpoint protegido no backend para disparo da publicacao.
5. Expor acao no frontend para o usuario dono do perfil.
6. Reutilizar upload de foto ja existente para preencher hasPhoto (sem novo uploader).

---

## Confirmacao importante: upload de foto ja existe
Nao criar novo fluxo de upload.

Ponto de reutilizacao:
- backend/src/shared/files/imageUpload.js
- backend/src/utils/imageUpload.js (wrapper)
- backend/src/controllers/academic/PublicProfilesController.js (uploadAvatar/selectDefaultAvatar)

Regra do MVP:
- hasPhoto no payload publicado deve ser derivado de profileImage ja salvo no usuario/perfil.
- nao duplicar logica de storage de imagem na feature de publicacao.

---

## Padronizacao obrigatoria (backend)

### Arquitetura
Manter fluxo:
- routes -> controllers -> services -> models

Regra de responsabilidade:
1. Route define endpoint e middlewares.
2. Controller valida contexto HTTP e orquestra servicos.
3. Service concentra regra de negocio e integracoes externas.
4. Model permanece com persistencia SQL.

### Logs (snippet padrao)
Usar formato existente:
- inicio: 🔵
- sucesso: 🟢
- aviso: 🟡
- erro: 🔴

Padrao de linha:
- [Camada] [Arquivo] [Funcao] mensagem | contexto-chave

Implementacao recomendada:
- backend/src/shared/logging/logger.js
- getLogger(__filename)

Exemplo:
- log.start('Iniciando publicacao em sandbox', { userId })
- log.success('Publicacao concluida', { prUrl })
- log.warn('Sem alteracoes para publicar', { userId })
- log.error('Falha na publicacao', { err: error.message })

### Comentarios padronizados
Usar JSDoc em metodos e classes com:
1. O que faz
2. Camada
3. Entradas/Saidas
4. Dependencias criticas
5. Efeitos colaterais
6. @param / @returns / @throws quando aplicavel

---

## Estrutura de diretorios (manter hierarquia atual)

### Arquivos novos criados
- backend/src/services/academic/ProfileTransformer.js
- backend/src/services/academic/GitHubPublishService.js
- frontend/src/features/publicProfile/hooks/usePublishSandbox.ts
- documents/01-GUIAS/backend/especificos/GUIA_PUBLICACAO_PERFIL_SANDBOX.md

### Arquivos alterados
- backend/src/services/academic/PublicProfilesService.js
- backend/src/controllers/academic/PublicProfilesController.js
- backend/src/routes/academic/PublicProfilesRoutes.js
- frontend/src/services/ProfileService.ts
- frontend/src/pages/academic/PublicProfilePage.tsx

### Regra para proximas expansoes
Se criar novos diretorios, seguir agrupamento por dominio existente:
- backend/src/services/academic/<feature>/...
- backend/src/controllers/academic/<feature>/...
- frontend/src/features/publicProfile/<feature>/...

---

## Reutilizacao de codigo adotada

1. Reuso do service principal de perfil:
- PublicProfilesService.getCompleteProfile(userId)

2. Reuso da camada de auth/ownership:
- authenticateToken
- verifyProfileOwnership

3. Reuso de upload de foto existente:
- uploadAvatar/selectDefaultAvatar ja presentes
- publicacao usa profileImage para hasPhoto

4. Reuso de ProfileService no frontend:
- novo metodo publishSandbox adicionado ao service existente

5. Reuso do logger padrao:
- getLogger(__filename) nos novos services backend

---

## Detalhamento da implementacao feita

## 1) Transformacao de dados
Arquivo:
- backend/src/services/academic/ProfileTransformer.js

Responsabilidade:
1. Converter perfil completo em payload do site publico.
2. Garantir campos obrigatorios:
- nome
- turma (AAAA)
- conteudo (array nao vazio)
- hasPhoto
3. Popular opcionais quando houver:
- contact (email/linkedin/lattes/github/site)
- avancado
- extracurricular
4. Gerar slug e path de arquivo:
- estudantes/<turma>/<slug>.json

Decisao de padrao:
- sem dependencia nova para validacao de schema nesta fase
- validacao de obrigatorios feita internamente

## 2) Publicacao no GitHub sandbox
Arquivo:
- backend/src/services/academic/GitHubPublishService.js

Responsabilidade:
1. Gerar JWT do GitHub App.
2. Trocar por installation token.
3. Clonar/atualizar repo sandbox local temporario.
4. Criar branch de trabalho.
5. Escrever profile JSON.
6. Atualizar roster da turma.
7. Commit/push apenas se houver mudanca.
8. Abrir PR automatica.

Decisoes de seguranca:
1. Owner/repo default fixados para sandbox via env:
- GITHUB_SANDBOX_OWNER
- GITHUB_SANDBOX_REPO
2. Nao usar repo oficial no MVP.
3. Sem push direto em main.

## 3) Exposicao no service principal
Arquivo:
- backend/src/services/academic/PublicProfilesService.js

Novo metodo:
- exportProfileToCMSchema(userId)

Responsabilidade:
1. Reusar getCompleteProfile.
2. Aplicar ProfileTransformer.
3. Retornar payload pronto para publicacao.

## 4) Endpoint no controller
Arquivo:
- backend/src/controllers/academic/PublicProfilesController.js

Novo metodo:
- publishSandbox(req, res)

Fluxo:
1. Recebe userId da rota.
2. Gera payload CM via service.
3. Publica via GitHubPublishService.
4. Retorna resultado com:
- success
- branchName
- prUrl
- filesChanged
- noChanges (quando aplicavel)

Tratamento de erros:
1. MissingRequiredFieldError -> HTTP 400
2. Demais erros -> HTTP 500

## 5) Rota protegida
Arquivo:
- backend/src/routes/academic/PublicProfilesRoutes.js

Nova rota:
- POST /api/profiles/:userId/publish-sandbox

Middlewares:
1. authenticateToken
2. verifyProfileOwnership

## 6) Frontend: consumo e acao
Arquivos:
- frontend/src/services/ProfileService.ts
- frontend/src/features/publicProfile/hooks/usePublishSandbox.ts
- frontend/src/pages/academic/PublicProfilePage.tsx

Implementado:
1. Metodo publishSandbox(userId) no ProfileService.
2. Hook dedicado para estado de publicacao:
- isPublishing
- publishError
- publishResult
3. Botao "Publicar no Sandbox" na pagina de perfil proprio.
4. Link para abrir PR quando criada.
5. Mensagem de "sem alteracoes" quando noChanges=true.

---

## Variaveis de ambiente necessarias
Backend:
- GH_APP_ID
- GH_APP_PRIVATE_KEY
- GITHUB_INSTALLATION_ID
- GITHUB_SANDBOX_OWNER (default: ccm-usp)
- GITHUB_SANDBOX_REPO (default: ccm-website-public-sandbox)
- GITHUB_SANDBOX_BASE_BRANCH (default: main)

Observacao:
- GH_APP_PRIVATE_KEY pode vir com \n escapado; o service ja converte para quebra real.

---

## Regras de evolucao para proximos commits

1. Nao duplicar regra de transformacao em controller.
- toda regra de mapeamento deve ficar em ProfileTransformer.

2. Nao mover persistencia para service.
- acesso SQL continua em models.

3. Nao quebrar contratos existentes de PublicProfile.
- endpoint novo deve ser aditivo.

4. Nao criar rota sem middlewares de ownership.

5. Evitar arquivos grandes.
- ideal <= 200 linhas por arquivo (quebrar em modulos quando crescer).

---

## Checklist de padronizacao antes de merge

1. Logs
- [ ] usa snippet padrao com emoji/camada/contexto
- [ ] sem dados sensiveis em log

2. Comentarios
- [ ] JSDoc presente nos novos metodos publicos
- [ ] responsabilidade da camada explicita

3. Reuso
- [ ] reaproveita upload de foto existente
- [ ] reaproveita auth middleware existente
- [ ] reaproveita service central de perfil

4. Arquitetura
- [ ] route sem regra de negocio
- [ ] controller sem SQL direto novo
- [ ] service sem conhecimento de UI

5. Estrutura
- [ ] novos arquivos em pastas de dominio corretas
- [ ] sem criar hierarquia paralela fora do padrao

---

## Validacao critica: vinculacao de nome a roster

### Problema identificado
Se o usuario colocar um nome diferente no BibliotecaCM do que esta registrado em `estudantes/<turma>/<turma>.json`, o sistema cria um **perfil orfao**:

**Exemplo:**
- BibliotecaCM: nome = "João Silva", turma = 2025
- `estudantes/2025/2025.json` tem: "João Augusto Silva Pereira"
- Resultado: publica como `estudantes/2025/joao-silva.json`, mas nao aparece na listagem da turma

### Impacto
- Perfil criado sem ser exibido publicamente (quebra UX)
- Arquivo desconectado do roster da turma
- Usuario nao vê seu perfil publicado
- Duplicacao potencial de nomes no site

### Solucao obrigatoria (implementar antes de merge)

**Adicionar validacao no ProfileTransformer.js:**

1. Carregar roster da turma: `estudantes/<turma>/<turma>.json`
2. Buscar nome do usuario contra a lista de estudantes
3. Se NAO encontrar match exato:
   - Retornar erro: `MissingRosterValidationError`
   - Mensagem: "Seu nome não está registrado como estudante desta turma. Verifique o nome completo com a coordenação."
4. Se encontrar:
   - Usar nome da roster para publicacao (prioridade roster > BibliotecaCM)
   - Garantir consistencia

**Pseudocodigo:**

```javascript
// ProfileTransformer.js
async transformToPublicSchema(profileData, year) {
  // ... validacoes existentes ...
  
  // NOVO: validar nome na roster
  const roster = await loadRoster(year);
  const foundInRoster = roster.estudantes.find(e => 
    this.normalizeNameForComparison(e.nome) === 
    this.normalizeNameForComparison(profileData.nome)
  );
  
  if (!foundInRoster) {
    throw new MissingRosterValidationError(
      `Nome "${profileData.nome}" nao consta na turma ${year}. ` +
      `Consulte a lista oficial de estudantes.`
    );
  }
  
  // Usar nome da roster como canonical
  const canonicalName = foundInRoster.nome;
  const slug = this.generateSlug(canonicalName);
  
  // ... resto da transformacao ...
}
```

### Estrategia de normalizacao de nomes
Para uma comparacao robusta, implementar:

```javascript
normalizeNameForComparison(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // multiplos espacos em um
    .normalize('NFD')     // decomposicao unicode (acentos)
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, ''); // remove caracteres especiais
}
// "João Augusto Silva Pereira" -> "joao augusto silva pereira"
// "joao silva" -> "joao silva"
// Mesmo com variacao: encontra match
```

### Contexto:
- Esta validacao impede que perfis "orphaos" sejam criados
- Garante consistencia entre BibliotecaCM e site publico
- Melhora experiencia do usuario (feedback claro)

### Implementacao recomendada:
1. Criar helper `src/shared/text/nameNormalizer.js` com funcao de normalizacao
2. Usaro em ProfileTransformer.js
3. Reutilizar em controller com try/catch apropriado
4. Retornar HTTP 400 + mensagem clara quando validacao falhar

### Cenarios de teste minimos:
- Nome exato match: ✅ publica
- Nome com espacos extras: ✅ publica (normalizacao)
- Nome com acentos diferentes: ✅ publica (normalizacao)
- Nome totalmente fora da roster: ❌ retorna erro 400
- Nome parcial da roster: ❌ retorna erro 400

---

## Proximos passos (sequencia recomendada)
1. **[BLOQUEANTE] Implementar validacao de nome contra roster** (v. secao acima).
   - Sem isso, perfis orphaos podem ser criados.
2. Validar endpoint novo localmente com usuario autenticado.
3. Testar publicacao real no sandbox com perfil completo.
4. Validar atualizacao do roster em diferentes formatos (array/object).
5. Adicionar endpoint de status/ultimo publish (opcional curto prazo).
6. Criar testes automatizados para transformer e publisher (curto prazo).
7. Planejar fase 2 para campos opcionais faltantes no banco.

---

## Observacoes finais
1. Esta implementacao inicia o fluxo fim-a-fim com base na arquitetura atual.
2. Upload de foto nao foi recriado; foi explicitamente reutilizado.
3. A documentacao e o codigo seguem padronizacao de logs, comentarios e hierarquia de diretorios do projeto.
