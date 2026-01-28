# Padrões de Código de Livros da Biblioteca

> ⚠️ **Nota**: Este documento será substituído pelo PDF oficial dos padrões da biblioteca.

## Informações Importantes

O código do livro é um identificador único que segue padrões específicos da biblioteca.

### Por que o código é importante?

- **Livros iguais** (mesmo título, autor, edição, volume) devem ter o **mesmo código**
- **Exemplares diferentes** do mesmo livro compartilham o código
- **Volumes diferentes** têm códigos diferentes
- O código facilita a organização física e digital do acervo

### Formato Geral (Exemplo)

```
AAA##-###
```

Onde:
- `AAA` = Código da área (ex: MAT, FIS, QUI, BIO, COM)
- `##` = Código da subárea (ex: 01, 02, 03...)
- `###` = Número sequencial único

### Exemplos

- `MAT01-001` - Primeiro livro de Matemática, subárea 01
- `FIS02-120` - Livro 120 de Física, subárea 02
- `QUI01-045` - Livro 45 de Química, subárea 01

### Como Criar Códigos para Importação CSV

1. **Consulte o catálogo existente** para verificar se o livro já existe
2. **Use o mesmo código** se for um exemplar adicional do mesmo livro
3. **Crie um novo código** seguindo a numeração sequencial se for um livro novo
4. **Mantenha consistência** com os padrões estabelecidos

---

**📄 Este arquivo será substituído pelo PDF oficial: `padroes_codigo_livros.pdf`**
