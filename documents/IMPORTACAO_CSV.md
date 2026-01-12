# Importação de Livros via CSV

Este documento explica como usar a funcionalidade de importação em lote de livros através de arquivos CSV.

## ⚠️ AVISOS IMPORTANTES

1. **O código do livro (code) é OBRIGATÓRIO** e deve ser fornecido no CSV
2. **NÃO é gerado automaticamente** - você deve criar seguindo os padrões
3. **Livros iguais devem ter o mesmo código** para serem identificados corretamente
4. **Consulte os [Padrões da Biblioteca](./padroes_codigo_livros.pdf)** antes de criar códigos

## Como Usar

1. Acesse a **Página Admin**
2. Vá para a aba **Gerenciamento de Livros**
3. Clique no botão **Importar CSV** (roxo)
4. Arraste e solte um arquivo CSV ou clique em "Selecionar Arquivo"
5. Clique em **Importar Livros** para processar

## Formato do CSV

### Campos Obrigatórios

Os seguintes campos **devem** estar presentes e preenchidos para cada livro:

- `code` - **Código do livro** (deve seguir os [Padrões da Biblioteca](./padroes_codigo_livros.pdf))
  - ⚠️ **IMPORTANTE**: O código do livro NÃO é gerado automaticamente
  - Livros iguais devem ter o mesmo código
  - Exemplares diferentes do mesmo livro/volume compartilham o código
  - Consulte o documento de padrões para saber como criar códigos corretamente
- `title` - Título do livro
- `authors` - Autores (separados por ponto e vírgula se múltiplos)
- `area` - Código da área (ex: MAT, FIS, QUI, BIO, COM)
- `subarea` - Código da subárea (número de 1 a 99)
- `edition` - Edição do livro
- `language` - Código do idioma (1 para Português, 2 para Inglês, etc.)
- `volume` - Volume do livro (número inteiro)

### Campos Opcionais

Estes campos podem ser deixados vazios:

- `subtitle` - Subtítulo do livro
- `isbn` - Código ISBN
- `year` - Ano de publicação
- `publisher` - Editora
- `observations` - Observações adicionais
- `barcode` - Código de barras EAN-13

**Importante:** Se o campo `barcode` não for fornecido ou estiver vazio, o sistema **gerará automaticamente** um código de barras único EAN-13 para o livro.

### Exemplo de Cabeçalho CSV

```csv
code,title,authors,area,subarea,edition,language,volume,subtitle,isbn,year,publisher,barcode,observations
```

**⚠️ ATENÇÃO**: O campo `code` deve ser o primeiro ou estar claramente identificado no cabeçalho.

### Exemplo de Dados

```csv
MAT01-001,Cálculo Volume 1,James Stewart,MAT,1,7ª edição,1,1,Early Transcendentals,978-1285741550,2015,Cengage Learning,,Material de apoio
QUI01-045,Química Geral,Raymond Chang,QUI,1,10ª edição,1,1,Conceitos essenciais,978-0073402758,2010,McGraw-Hill,,
FIS02-120,Física para Cientistas,Paul Tipler,FIS,2,6ª edição,1,1,,978-1429201322,2008,W.H. Freeman,1234567890123,
```

**Nota**: Os códigos acima são exemplos. Consulte os [Padrões da Biblioteca](./padroes_codigo_livros.pdf) para criar códigos corretos.

## Códigos de Área

- `MAT` - Matemática
- `FIS` - Física
- `QUI` - Química
- `BIO` - Biologia
- `COM` - Computação

## Códigos de Idioma

- `1` - Português
- `2` - Inglês
- `3` - Espanhol

## Validação e Erros

Durante a importação:

- **Campos vazios obrigatórios** geram erro e a linha é ignorada
- **Código do livro ausente** gera erro específico orientando sobre os padrões
- **Código de barras vazio** é gerado automaticamente
- **Erros são exibidos** com o número da linha e descrição do problema
- **Livros válidos são importados** mesmo que outros apresentem erro

### Sobre Livros Duplicados

- **Mesmos códigos são permitidos**: Exemplares diferentes do mesmo livro devem ter o mesmo código
- **Códigos de barras são únicos**: Mesmo com código igual, cada exemplar terá um código de barras diferente
- **Organização**: Livros com mesmo código são considerados o mesmo título/edição/volume

## Resultado da Importação

Após a importação, você verá:

- ✅ **Número de livros importados com sucesso**
- ❌ **Número de livros que falharam**
- 📋 **Lista detalhada de erros** (linha e motivo)

## Arquivo de Exemplo

Um arquivo CSV de exemplo está disponível em:
`/documents/exemplo_importacao_livros.csv`

## Dicas

1. **Use UTF-8**: Salve o CSV em codificação UTF-8 para evitar problemas com acentos
2. **Aspas duplas**: Use aspas duplas para campos que contenham vírgulas
3. **Teste primeiro**: Importe um arquivo pequeno para validar o formato
4. **Backup**: Sempre faça backup antes de importações grandes
5. **Consulte os padrões**: Sempre verifique os [Padrões da Biblioteca](./padroes_codigo_livros.pdf) ao criar códigos

---

## 📄 Documentos Relacionados

- **[Padrões de Código de Livros](./padroes_codigo_livros.pdf)** - ⚠️ Adicione o PDF neste caminho
- **[Exemplo de CSV](./exemplo_importacao_livros.csv)** - Arquivo de exemplo pronto para uso

> **Nota para administradores**: Coloque o PDF dos padrões da biblioteca em `/documents/padroes_codigo_livros.pdf` para que o link funcione corretamente.

## Geração Automática

O sistema gera automaticamente:

- ✅ **Código de barras (EAN-13)** - se não fornecido
- ✅ **ID do livro** - identificador único no banco de dados

❌ **O código do livro (code) NÃO é gerado automaticamente** - deve ser fornecido no CSV seguindo os [Padrões da Biblioteca](./padroes_codigo_livros.pdf)
