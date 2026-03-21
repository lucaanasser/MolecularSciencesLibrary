# GUIA RAPIDO: ALIASES E SAVE

Objetivo: ensinar o basico para usar os atalhos do projeto e fazer commits com o fluxo guiado do comando save.

## 1) Configurar aliases (uma vez)
No diretorio do projeto:

```bash
bash scripts/setup-aliases.sh
source ~/.bash_aliases
```

Depois disso, os comandos podem ser executados de qualquer pasta do terminal.

## 2) Ver lista de aliases
Para ver todos os atalhos disponiveis:

```bash
aliases
```

Atalhos mais usados no dia a dia:
- `dev`: abre menu de desenvolvimento
- `status`: mostra status dos containers
- `logs`: acompanha logs em tempo real
- `stop`: para containers
- `save`: cria commit guiado por lote

## 3) Como usar o save
O comando save foi feito para reduzir erros de commit.

```bash
save
```

Fluxo do save:
1. Mostra os arquivos pendentes com indice numerico.
2. Voce escolhe os arquivos do lote (ex.: `1,3,5`) ou `a` para todos.
3. Mostra diff stat do que foi staged.
4. Pede tipo de commit (`feat`, `fix`, `refactor`, `docs`, `chore`, `test`).
5. Sugere scope automatico (`backend`, `frontend`, `docs`, `scripts`, `repo`, `multi`).
6. Pede resumo do commit (minimo recomendado: 10 caracteres).
7. Mostra a mensagem final e pede confirmacao.
8. Ao final, pergunta se deve executar push.

Formato da mensagem gerada:

```text
tipo(scope): resumo
```

Exemplos:
- `feat(frontend): adiciona filtro por area no catalogo`
- `fix(backend): corrige validacao de renovacao`
- `docs(docs): atualiza trilha inicial de onboarding`

## 4) Boas praticas com save
- Um objetivo por commit.
- Evitar misturar backend, frontend e docs no mesmo lote.
- Se misturar de forma intencional, usar scope `multi`.
- Revisar o diff stat antes de confirmar.
- Se estiver na branch main, redobrar atencao.

## 5) Quando usar manual em vez de save
Use git manual quando precisar de fluxo avancado, por exemplo:
- squash parcial muito especifico
- rebase interativo
- cherry-pick de commits antigos

O save ajuda no fluxo padrao, mas nao bloqueia operacoes manuais.