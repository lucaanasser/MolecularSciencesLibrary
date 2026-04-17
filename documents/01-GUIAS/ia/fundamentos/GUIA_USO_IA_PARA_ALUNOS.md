# GUIA PRATICO DE USO DE IA PARA NOVOS MANTENEDORES

## Objetivo
Ensinar alunos a usar IA de forma produtiva e segura, sem degradar o codigo ao longo das turmas.

---

## 1) Regra de ouro
Nunca copiar e aceitar codigo da IA sem revisar.

Perguntas obrigatorias antes de aceitar uma sugestao:
1. Isso respeita a arquitetura do projeto?
2. Isso quebra algum endpoint/comando existente?
3. Isso adiciona risco de seguranca ou vazamento?
4. Eu consigo explicar esta mudanca para outra pessoa?

Se qualquer resposta for "nao sei", pare e investigue.

---

## 2) Como pedir melhor para IA (na pratica)
Sempre informe:
- contexto (arquivo/camada)
- objetivo
- restricoes
- o que NAO pode mudar
- como validar

Exemplo bom:
"Refatore apenas backend/src/services/library/loans.
Nao mude assinatura publica.
Mantenha compatibilidade com endpoints atuais.
Aplique logger padronizado e comentarios obrigatorios.
Mostre validacao minima apos editar."

---

## 3) Quando NAO usar IA
- decisao arquitetural sem contexto historico
- mudanca sensivel de seguranca/autenticacao
- migracao de dados sem plano de rollback
- incidentes de producao sem reproduzir causa raiz

Nesses casos, use IA apenas como apoio, nunca como autor principal.

---

## 4) Regras de revisao humana
Toda mudanca assistida por IA deve ser revisada por humano em:
- corretude funcional
- aderencia aos guias do projeto
- qualidade de nomes e comentarios
- impacto em scripts/automacoes

---

## 5) Erros comuns de times que usam IA sem regra
- aceitar refatoracao grande demais em um unico commit
- perder compatibilidade de caminho/script
- deixar comentarios mentindo sobre o codigo
- inflar codigo com abstrações desnecessarias
- mudar estilo por arquivo e criar inconsistencias

---

## 6) Politica minima por semestre
- revisar guias de IA no inicio de cada turma
- revisar 3 PRs reais com este guia em maos
- atualizar exemplos defasados
- remover regras que nao agregam e reforcar as que evitaram erros

---

## 7) Critério de bloqueio de PR
PR deve ser bloqueado se:
- nao houver secao de uso de IA
- nao houver validacao minima
- violar padrao de logs/comentarios
- mudar contrato externo sem plano de migracao

Fim.
