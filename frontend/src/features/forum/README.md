# MolecOverflow - Fórum Acadêmico

Uma paródia do Stack Overflow dedicada a dúvidas acadêmicas do curso de Ciências Moleculares.

## 🎨 Visão Geral

O MolecOverflow é um fórum estilo Stack Overflow criado especificamente para ajudar alunos a tirarem dúvidas sobre:
- Créditos necessários para formatura
- Como escrever projetos de avançado
- Encontrar orientadores
- Grade curricular
- Optativas
- E muito mais!

## 📁 Estrutura de Arquivos

```
frontend/src/
├── features/forum/
│   └── components/
│       ├── QuestionCard.tsx      # Card individual de pergunta
│       ├── ForumHeader.tsx        # Header com branding Stack UnderFlow
│       ├── ForumSidebar.tsx       # Sidebar com tags e top contributors
│       └── ForumFilters.tsx       # Filtros de ordenação
├── pages/
│   ├── ForumPage.tsx              # Página principal do fórum
│   ├── QuestionDetailPage.tsx    # Detalhes de uma pergunta específica
│   └── NewQuestionPage.tsx        # Formulário de nova pergunta
```

## 🎭 Características

### Design Paródia
- **MolecOverflow**: Nome que mistura "Moleculares" com "Overflow" (inspirado no Molecoogle)
- **Tagline**: "Where developers ~~copy code~~ learn together"
- **Cores**: Roxo (#9333EA, #A855F7) que combina com o tema CM
- **Humor**: Dicas sarcásticas mas úteis ("Pesquise antes de perguntar (mas sabemos que você não vai)")

### Funcionalidades Frontend

#### Página Principal (`/forum`)
- Lista de perguntas com preview
- Sistema de votação (upvote/downvote)
- Contador de respostas e views
- Tags por pergunta
- Filtros: Recente, Mais Votadas, Atividade, Sem Resposta
- Busca por texto e tags
- Sidebar com:
  - Tags populares
  - Top contributors
  - Estatísticas gerais
  - Dicas do Stack UnderFlow

#### Página de Detalhes (`/forum/:id`)
- Pergunta completa com formatação
- Sistema de votação
- Respostas ordenadas por votos
- Resposta aceita destacada em verde
- Formulário para nova resposta
- Perguntas relacionadas na sidebar
- Ações: compartilhar, editar, denunciar

#### Nova Pergunta (`/forum/nova-pergunta`)
- Formulário com validação
- Título (mínimo 15 caracteres)
- Conteúdo (mínimo 30 caracteres)
- Sistema de tags (até 5)
- Tags sugeridas clicáveis
- Dicas de como fazer uma boa pergunta
- Preview ao vivo (futuro)

## 🎨 Paleta de Cores

```css
/* Principal */
--purple-600: #9333EA   /* Cor primária (botões, destaques) */
--purple-700: #7E22CE   /* Hover states */
--purple-100: #F3E8FF   /* Background de tags */

/* Status */
--green-600: #16a34a    /* Resposta aceita */
--green-50: #f0fdf4     /* Background resposta aceita */
--blue-600: #2563eb     /* Links */
--yellow-50: #fefce8    /* Dicas/avisos */
```

## 📊 Mock Data

Atualmente utiliza dados mockados (estáticos) para demonstração. Inclui:
- 8 perguntas de exemplo
- 2 respostas de exemplo por pergunta
- Tags populares
- Top contributors
- Estatísticas gerais

## 🔮 Próximos Passos (Backend)

Quando o backend for implementado, será necessário:

### Endpoints da API

```typescript
// Perguntas
GET    /api/forum/questions              // Listar perguntas
GET    /api/forum/questions/:id          // Detalhes de uma pergunta
POST   /api/forum/questions              // Criar pergunta
PUT    /api/forum/questions/:id          // Editar pergunta
DELETE /api/forum/questions/:id          // Deletar pergunta
POST   /api/forum/questions/:id/vote     // Votar em pergunta

// Respostas
GET    /api/forum/questions/:id/answers  // Listar respostas
POST   /api/forum/questions/:id/answers  // Criar resposta
PUT    /api/forum/answers/:id            // Editar resposta
DELETE /api/forum/answers/:id            // Deletar resposta
POST   /api/forum/answers/:id/vote       // Votar em resposta
POST   /api/forum/answers/:id/accept     // Aceitar resposta

// Tags
GET    /api/forum/tags                   // Listar tags populares
GET    /api/forum/tags/:name/questions   // Perguntas por tag

// Estatísticas
GET    /api/forum/stats                  // Estatísticas gerais
GET    /api/forum/contributors           // Top contributors
```

### Banco de Dados (Sugestão)

```sql
-- Tabela de perguntas
CREATE TABLE forum_questions (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  autor_id INTEGER REFERENCES users(id),
  votos INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de respostas
CREATE TABLE forum_answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES forum_questions(id),
  conteudo TEXT NOT NULL,
  autor_id INTEGER REFERENCES users(id),
  votos INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tags
CREATE TABLE forum_tags (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  count INTEGER DEFAULT 0
);

-- Relacionamento pergunta-tag
CREATE TABLE forum_question_tags (
  question_id INTEGER REFERENCES forum_questions(id),
  tag_id INTEGER REFERENCES forum_tags(id),
  PRIMARY KEY (question_id, tag_id)
);

-- Tabela de votos
CREATE TABLE forum_votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  votable_type VARCHAR(20), -- 'question' ou 'answer'
  votable_id INTEGER,
  vote_type INTEGER, -- 1 para upvote, -1 para downvote
  UNIQUE(user_id, votable_type, votable_id)
);
```

## 🎯 Integração com o Sistema

- Rota adicionada em [App.tsx](../App.tsx)
- Link na Navigation (substituindo "Pessoas" por "Fórum")  
- Link no Footer
- Card de acesso na [AcademicIndexPage](../pages/AcademicIndexPage.tsx)
- Utiliza componentes existentes: Navigation, Footer
- Integrado com sistema de autenticação (futuro)

## 💡 Ideias Futuras

- [ ] Sistema de badges/conquistas
- [ ] Markdown editor com preview
- [ ] Upload de imagens
- [ ] Notificações de novas respostas
- [ ] Gamificação (pontos, níveis)
- [ ] Busca avançada
- [ ] Filtro por período (hoje, semana, mês)
- [ ] RSS feed
- [ ] Sistema de moderação
- [ ] Categorias além de tags

## 🎨 Inspirações de Design

- Stack Overflow (cores, layout, votação)
- Reddit (sistema de discussão)
- Discourse (sidebar de estatísticas)
- Google (página de busca paródia em AcademicIndexPage)

---

**Criado por**: Luca  
**Data**: Janeiro 2026  
**Status**: Frontend completo, aguardando backend
