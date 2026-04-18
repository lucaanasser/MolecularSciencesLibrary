# GUIA: Geração de Páginas de Estudantes (Sandbox)

## Objetivo
Gerar páginas HTML estáticas para cada estudante do CMsite-sandbox, criando URLs amigáveis como:
- `http://localhost:8082/comunidade/estudantes/2000/douglas-galante.html`

## Como Funciona

### Estrutura de Dados

**Entrada:**
- `CMsite-sandbox/estudantes/<turma>/<turma>.json` - Lista de estudantes da turma com metadados
- `CMsite-sandbox/estudantes/<turma>/<slug>.json` - Dados completos de cada estudante (opcional)

Exemplo de `2000.json`:
```json
{
  "estudantes": [
    {"nome": "Douglas Galante", "hasPage": true, "hasMainPhoto": true},
    ...
  ],
  "hasMainPhoto": true
}
```

**Saída:**
- `CMsite-sandbox/comunidade/estudantes/<turma>/<slug>.html` - Página HTML individual

### Script de Geração

**Arquivo:** `scripts/generate-student-pages.js`

**O que faz:**
1. Lê todos os JSONs em `estudantes/<turma>/<turma>.json`
2. Para cada estudante com `hasPage: true`:
   - Converte nome → slug (ex: "Douglas Galante" → "douglas-galante")
   - Carrega dados completos se existir `<slug>.json` individual
   - Gera página HTML usando template incluído no script
   - Salva em `comunidade/estudantes/<turma>/<slug>.html`

## Como Usar

### Opção 1: Via npm (Recomendado)
```bash
npm run generate:pages
```

### Opção 2: Via node direto
```bash
node scripts/generate-student-pages.js
```

### Resultado
```
🔵 Iniciando geração de páginas de estudantes...

🟢 Gerado: comunidade/estudantes/2000/douglas-galante.html
🟢 Gerado: comunidade/estudantes/2019/heloisa-de-lazari-bento.html
...
✨ Concluído!
📊 Total gerado: 12 páginas
```

## Acessar Localmente

Após gerar as páginas:

**Navegador:**
```
http://localhost:8082/comunidade/estudantes/2000/douglas-galante.html
http://localhost:8082/comunidade/estudantes/2019/heloisa-de-lazari-bento.html
```

## Estrutura do JSON Individual

Para ter uma página detalhada, crie um arquivo `estudantes/<turma>/<slug>.json`:

```json
{
  "nome": "Douglas Galante",
  "turma": "2000",
  "origem": "Física",
  "especializacao": ["Astrobiologia"],
  "concentracao": ["Ciências Biológicas", "Geociências"],
  "conteudo": [
    "Apaixonado pelo céu desde criança...",
    "Bacharel em ciências moleculares..."
  ],
  "avancado": [
    "Título do projeto de avançado"
  ],
  "extracurricular": [
    {"title": "Liderança do grupo Carnaúba", "link": "..."},
    "Outras atividades"
  ],
  "conquistas": [
    "Primeira tese em astrobiologia no país em 2009"
  ],
  "contato": {
    "email": "email@gmail.com.br",
    "lattes": "https://lattes.cnpq.br/...",
    "linkedin": "https://linkedin.com/...",
    "github": "https://github.com/...",
    "site": "https://...",
    "behance": "https://behance.net/...",
    "telefone": "+55 11 99999-9999"
  },
  "hasPhoto": true
}
```

## Fotos

**Estrutura esperada:**
```
CMsite-sandbox/
  estudantes/
    2000/
      douglas-galante.jpg       (272×272px, max 50kb)
      douglas-galante@2x.jpg    (544×544px, max 100kb)
      douglas-galante.json
```

**Se não houver foto:**
- Use placeholder automático no template
- Defina `"hasPhoto": false` no JSON

## Fluxo Completo de Publicação

1. **Usuário cria/atualiza perfil no BibliotecaCM**
   - Backend valida e transforma dados

2. **Backend publica no GitHub**
   - Cria `estudantes/<turma>/<slug>.json` no ccm-website-public-sandbox

3. **Depois, localmente:**
   ```bash
   npm run generate:pages
   ```
   - Script lê os JSONs
   - Gera as páginas HTML estáticas

4. **Deploy em produção:**
   - As páginas HTML já estão prontas
   - Copiar arquivos para VPS da USP
   - Zero diferença com ambiente local

## Diferenças Local vs Produção

| Aspecto | Local | Produção |
|---------|-------|----------|
| Estrutura | HTML estático | HTML estático |
| URLs | `/comunidade/estudantes/<turma>/<slug>.html` | `/comunidade/estudantes/<turma>/<slug>` (com rewrite) |
| Dados | `estudantes/<turma>/<slug>.json` | GitHub CDN ou servidor |
| Geração | Manual ou npm script | Automático no CI/CD |

**Na VPS da USP:** Use `.htaccess` (Apache) ou configuração similar para remapear URLs sem `.html`

## Exemplo .htaccess (Produção)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Se não é arquivo ou pasta
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Remapear para .html
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.*)$ $1.html [L]
</IfModule>
```

Com isso, URLs funcionam com ou sem `.html`:
- `http://localhost:8082/comunidade/estudantes/2000/douglas-galante`
- `http://localhost:8082/comunidade/estudantes/2000/douglas-galante.html`

## FAQ

**P: Como adicionar um novo estudante?**
R: Criar `CMsite-sandbox/estudantes/<turma>/<slug>.json` e rodar `npm run generate:pages`

**P: Como atualizar uma página existente?**
R: Editar o JSON e rodar `npm run generate:pages` novamente

**P: Posso editar HTML direto?**
R: Não é recomendado. Toda mudança será sobrescrita ao rodar o script novamente.

**P: Como fazer com que hasPage seja true automaticamente?**
R: Editar o JSON individual para ter todos os campos obrigatórios, o script considera como "profundo" e prioriza usar esse

## Próximos Passos

1. Integrar com CI/CD para gerar automaticamente em cada commit
2. Adicionar validação de schema JSON antes de gerar
3. Criar pré-visualização antes de publicar
4. Implementar cache inteligente (só gerar o que mudou)
