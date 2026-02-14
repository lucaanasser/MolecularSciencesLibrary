# Script para migração de dados dos livros

import pandas as pd
import numpy as np

books = pd.read_csv('backend/scripts/migrations/books_feb26.csv')
loans = pd.read_csv('backend/scripts/migrations/loans_feb26.csv')
print('🔵 Colunas na DB antes da operação:\n', list(books.columns))
allGood = True

########### Atualização de languages (number -> string) ###########
language_mapping = {
  1: 'Português',
  2: 'Inglês',
  3: 'Espanhol',
  4: 'Outro',
}
books['language'] = books['language'].replace(language_mapping)

valid_languages = {'Português', 'Inglês', 'Espanhol', 'Outro'}
check_language = books['language'].isin(valid_languages).all()
if not check_language:
  print('🔴 Erros na atualização de linguagens')
  print(books[~books['language'].isin(valid_languages)][['id', 'language']])
  allGood = False

########### Atualização das subareas (number -> string) ###########
subareas_mapping = {
  'Matemática': 
  {
    1: 'Cálculo',
    2: 'Geometria Analítica',
    3: 'Álgebra Linear',
    4: 'Análise',
    5: 'Álgebra Abstrata',
    6: 'Topologia e Geometria',
    7: 'Lógica e Fundamentos',
    8: 'Equações Diferenciais',
    9: 'Funções Complexas'
  },
  'Física': 
  {
    1: 'Física Geral', 
    2: 'Mecânica', 
    3: 'Termodinâmica',
    4: 'Eletromagnetismo',
    5: 'Física Moderna',
    6: 'Física Matemática', 
    7: 'Astronomia e Astrofísica'
  },
  'Química': 
  {
    1: 'Química Geral', 
    2: 'Fisico-Química', 
    3: 'Química Inorgânica',
    4: 'Química Orgânica',
    5: 'Química Experimental' 
  },
  'Biologia': 
  {
    1: 'Bioquímica', 
    2: 'Biologia Molecular e Celular', 
    3: 'Genética e Evolução',
    4: 'Biologia de Sistemas',
    5: 'Desenvolvimento',
    6: 'Ecologia',
    7: 'Botânica'
  },
  'Computação': 
  {
    1: 'Fundamentos de Computação',
    2: 'Algoritmos e Estruturas de Dados',
    3: 'Análise Numérica',
    4: 'Probabilidade e Estatística', 
    5: 'Teoria da Computação',
    6: 'Programação',
    7: 'Sistemas e Redes'
  },
  'Variados': 
  {
    1: 'Divulgação Científica',
    2: 'História e Filosofia da Ciência',
    3: 'Interdisciplinares',
    4: 'Literatura', 
  },
}
def replace_subarea(row):
  area = row['area']
  subarea_number = row['subarea']
  return subareas_mapping.get(area, {}).get(subarea_number, 'error')
books['subarea'] = books.apply(replace_subarea, axis=1)

check_subarea = not (books['subarea'] == 'error').any()
if not check_subarea:
  print('🔴 Erros na atualização de subáreas:')
  print(books[books['subarea'] == 'error'][['id', 'area', 'subarea']])
  allGood = False

########### Atualização de status (is_reserved: int -> status: string) ###########
books = books.drop('is_reserved', axis=1)
loaned_books = loans[loans['returned_at'].isnull()]
loaned_ids = loaned_books['book_id'].tolist()
def get_status(row):
  if row['id'] in loaned_ids:
    return 'emprestado'
  return 'disponível'
books['status'] = books.apply(get_status, axis=1)

check_status = len(books[books['status'] == 'emprestado']) == len(loaned_ids)
if not check_status:
  print('🔴 Erros na atualização de status:')
  print('IDs emprestados que não foram marcados como "emprestado":', set(loaned_ids) - set(books[books['status'] == 'emprestado']['id'].tolist()))
  allGood = False

########### Limpeza de dados ###########
cols_to_check = [col for col in books.columns if col not in {'id', 'edition', 'volume'}]
for col in cols_to_check:
  books[col] = books[col].str.replace(r'\s+', ' ', regex=True) # substitui múltiplos espaços por um único espaço
  books[col] = books[col].str.strip() # remove espaços no início e no fim

########### Verificação final ###########
if allGood:
  print('🔵 Colunas na DB ao final da operação:\n', list(books.columns))
  print('\n🟢 Migração concluída com sucesso! Todos os dados estão consistentes.')
  books.to_csv('backend/scripts/migrations/books_migrated.csv', index=False)