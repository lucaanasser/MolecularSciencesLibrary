# TODO Frontend

## Modo Biblioteca

### Correção de Bugs
* `LoginPage`: Corrigir problema de responsividade em telas médias
* `VirtualBookshelf`: Corrigir lógica renderização de status do livro (todos constam como disponíveis)
* `LibrarySearchResultsPage`: Corrigir agrupamento de resultados por código do livro em vez de ID (atualmente entra em conflito com a exibição de detalhes do livro)
* `HelpTheLibrary`
    * Melhorar responsividade das imagens dentro dos cards no celular
    * Melhorar responsividade da roleta com nomes dos doadores

### Funcionalidades e Melhorias
* `LibrarySearchResultsPage`: Tornar grupo inteiro clicável em vez de apenas o campo principal
* `VirtualBookshelf`: Tornar cada livro clicável, levando para a respectiva página de detalhes do livro
* `AdminPage`
  * `Notificações`: Implementar funcionalidades permitindo filtros úteis (ex. usuários com livros atrasados)
  * `Relatórios`
    * Implementar os relatórios que faltam.
    * No relatório de empréstimos, fazer separação de "uso interno" vs. "externo"
* `TransparencyPortalPage`: Melhorar textos explicativos

### Refatorção e código antigo
* `AccountCreationPage`
* `ResetPasswordPage`
* `DonatorsWallPage`
* `EmailService`: Melhorar responsividade dos emails
* Eliminar código antigo das features de livros e usuários
  * Checar antes se há imports de tipos antigos e eliminar

## Modo Acadêmico

### Refatoração
* `AcademicIndexPage`: Refazer Hero Section
* `PublicProfilePage`: Eliminar dependências de tipos antigos e criar novos tipos específicos para perfil público

### Funcionalidades e Melhorias
* `AcademicSearchPage`: Implementar página de busca com botão para mudança entre modos "Usuários" e "Disciplinas"
  * `features/_users`: Criar props de busca para usuários
  * `features/_disciplines`: Revisar props de busca para disciplinas
* `GradePage`
    * Melhorar responsividade e padronizar estilos
    * Melhorar PDF gerado
* `ForumPage`: Melhorar responsividade e padronizar estilos
* `PublicProfilePage`
    * Melhorar responsividade e padronizar estilos
    * Terminar separação em componentes

## Documentação
- Garantir que todos os hooks e serviços estejam com comentários atualizados.