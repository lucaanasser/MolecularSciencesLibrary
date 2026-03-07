-- ============================================================
-- Migração: banco.db (schema antigo) → library.db (schema novo)
-- ============================================================
-- Uso na VPS:
--   sqlite3 library.db < backend/scripts/migrate_banco_to_library.sql
--
-- Pré-requisitos:
--   - library.db já criado com o schema novo (vazio)
--   - banco.db no mesmo diretório que library.db
-- ============================================================

PRAGMA foreign_keys = OFF;

ATTACH DATABASE '/root/MolecularSciencesLibrary/database/banco.db' AS old;

-- ============================================================
-- 1. USERS — adiciona status = 'active' para todos
-- ============================================================
INSERT INTO users (id, name, NUSP, email, phone, password_hash, role, profile_image, class, created_at, status)
SELECT id, name, NUSP, email, phone, password_hash, role, profile_image, class, created_at, 'active'
FROM old.users;

-- ============================================================
-- 2. BOOKS — language INT→TEXT, subarea INT→TEXT, is_reserved → status
--    Mapeamentos extraídos de books_migration.py
-- ============================================================
INSERT INTO books (id, code, area, subarea, title, subtitle, authors, edition, volume, language, status)
SELECT
  b.id, b.code, b.area,
  -- ---- subarea: INT → TEXT (por área) ----
  CASE
    -- Se já for texto (migração parcial anterior), mantém
    WHEN typeof(b.subarea) = 'text' AND b.subarea NOT GLOB '[0-9]*' THEN b.subarea
    ELSE CASE b.area
      WHEN 'Matemática' THEN CASE CAST(b.subarea AS INTEGER)
        WHEN 1 THEN 'Cálculo'
        WHEN 2 THEN 'Geometria Analítica'
        WHEN 3 THEN 'Álgebra Linear'
        WHEN 4 THEN 'Análise'
        WHEN 5 THEN 'Álgebra Abstrata'
        WHEN 6 THEN 'Topologia e Geometria'
        WHEN 7 THEN 'Lógica e Fundamentos'
        WHEN 8 THEN 'Equações Diferenciais'
        WHEN 9 THEN 'Funções Complexas'
        ELSE 'Desconhecido'
      END
      WHEN 'Física' THEN CASE CAST(b.subarea AS INTEGER)
        WHEN 1 THEN 'Física Geral'
        WHEN 2 THEN 'Mecânica'
        WHEN 3 THEN 'Termodinâmica'
        WHEN 4 THEN 'Eletromagnetismo'
        WHEN 5 THEN 'Física Moderna'
        WHEN 6 THEN 'Física Matemática'
        WHEN 7 THEN 'Astronomia e Astrofísica'
        ELSE 'Desconhecido'
      END
      WHEN 'Química' THEN CASE CAST(b.subarea AS INTEGER)
        WHEN 1 THEN 'Química Geral'
        WHEN 2 THEN 'Fisico-Química'
        WHEN 3 THEN 'Química Inorgânica'
        WHEN 4 THEN 'Química Orgânica'
        WHEN 5 THEN 'Química Experimental'
        ELSE 'Desconhecido'
      END
      WHEN 'Biologia' THEN CASE CAST(b.subarea AS INTEGER)
        WHEN 1 THEN 'Bioquímica'
        WHEN 2 THEN 'Biologia Molecular e Celular'
        WHEN 3 THEN 'Genética e Evolução'
        WHEN 4 THEN 'Biologia de Sistemas'
        WHEN 5 THEN 'Desenvolvimento'
        WHEN 6 THEN 'Ecologia'
        WHEN 7 THEN 'Botânica'
        ELSE 'Desconhecido'
      END
      WHEN 'Computação' THEN CASE CAST(b.subarea AS INTEGER)
        WHEN 1 THEN 'Fundamentos de Computação'
        WHEN 2 THEN 'Algoritmos e Estruturas de Dados'
        WHEN 3 THEN 'Análise Numérica'
        WHEN 4 THEN 'Probabilidade e Estatística'
        WHEN 5 THEN 'Teoria da Computação'
        WHEN 6 THEN 'Programação'
        WHEN 7 THEN 'Sistemas e Redes'
        ELSE 'Desconhecido'
      END
      WHEN 'Variados' THEN CASE CAST(b.subarea AS INTEGER)
        WHEN 1 THEN 'Divulgação Científica'
        WHEN 2 THEN 'História e Filosofia da Ciência'
        WHEN 3 THEN 'Interdisciplinares'
        WHEN 4 THEN 'Literatura'
        ELSE 'Desconhecido'
      END
      ELSE 'Desconhecido'
    END
  END,
  b.title, b.subtitle, b.authors, b.edition, b.volume,
  -- ---- language: INT → TEXT ----
  CASE
    WHEN typeof(b.language) = 'text' AND b.language NOT GLOB '[0-9]*' THEN b.language
    ELSE CASE CAST(b.language AS INTEGER)
      WHEN 1 THEN 'Português'
      WHEN 2 THEN 'Inglês'
      WHEN 3 THEN 'Espanhol'
      WHEN 4 THEN 'Outro'
      ELSE 'Outro'
    END
  END,
  -- ---- status: baseado em empréstimos ativos ----
  CASE
    WHEN EXISTS (
      SELECT 1 FROM old.loans l
      WHERE l.book_id = b.id AND l.returned_at IS NULL
    ) THEN 'emprestado'
    ELSE 'disponível'
  END
FROM old.books b;

-- ============================================================
-- 3. LOANS — student_id → user_id
-- ============================================================
INSERT INTO loans (id, book_id, user_id, borrowed_at, returned_at, renewals, due_date, is_extended, last_nudged_at)
SELECT id, book_id, student_id, borrowed_at, returned_at, renewals, due_date, is_extended, last_nudged_at
FROM old.loans;

-- ============================================================
-- 4. NOTIFICATIONS — schema idêntico
-- ============================================================
INSERT INTO notifications (id, user_id, type, message, metadata, loan_id, status, created_at)
SELECT id, user_id, type, message, metadata, loan_id, status, created_at
FROM old.notifications;

-- ============================================================
-- 5. RULES — schema idêntico
-- ============================================================
INSERT INTO rules (id, max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days,
  extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge,
  nudge_cooldown_hours, pending_nudge_extension_days)
SELECT id, max_days, overdue_reminder_days, max_books_per_user, max_renewals, renewal_days,
  extension_window_days, extension_block_multiplier, shortened_due_days_after_nudge,
  nudge_cooldown_hours, pending_nudge_extension_days
FROM old.rules;

-- ============================================================
-- 6. BADGES — schema idêntico
-- ============================================================
INSERT INTO badges (id, name, description, image_locked, image_unlocked, created_at)
SELECT id, name, description, image_locked, image_unlocked, created_at
FROM old.badges;

-- ============================================================
-- 7. DONATORS — schema idêntico
-- ============================================================
INSERT INTO donators (id, user_id, name, book_id, donation_type, amount, contact, notes, created_at)
SELECT id, user_id, name, book_id, donation_type, amount, contact, notes, created_at
FROM old.donators;

-- ============================================================
-- 8. VIRTUAL_BOOKSHELF — removido is_last_shelf
-- ============================================================
INSERT INTO virtual_bookshelf (id, shelf_number, shelf_row, book_code_start, book_code_end)
SELECT id, shelf_number, shelf_row, book_code_start, book_code_end
FROM old.virtual_bookshelf;

-- ============================================================
-- 9. DISCIPLINES — colunas novas recebem default (0 / NULL)
-- ============================================================
INSERT INTO disciplines (id, codigo, nome, unidade, campus, creditos_aula, creditos_trabalho,
  has_valid_classes, is_postgrad, ementa, objetivos, conteudo_programatico, created_at, updated_at)
SELECT id, codigo, nome, unidade, campus, creditos_aula, creditos_trabalho,
  has_valid_classes, 0, NULL, NULL, NULL, created_at, updated_at
FROM old.disciplines;

-- ============================================================
-- 10. DISCIPLINE_CLASSES — schema idêntico
-- ============================================================
INSERT INTO discipline_classes (id, discipline_id, codigo_turma, codigo_turma_teorica, tipo, inicio, fim, observacoes, created_at)
SELECT id, discipline_id, codigo_turma, codigo_turma_teorica, tipo, inicio, fim, observacoes, created_at
FROM old.discipline_classes;

-- ============================================================
-- 11. CLASS_SCHEDULES — schema idêntico
-- ============================================================
INSERT INTO class_schedules (id, class_id, dia, horario_inicio, horario_fim, created_at)
SELECT id, class_id, dia, horario_inicio, horario_fim, created_at
FROM old.class_schedules;

-- ============================================================
-- 12. CLASS_PROFESSORS — schema idêntico
-- ============================================================
INSERT INTO class_professors (id, class_id, schedule_id, nome, created_at)
SELECT id, class_id, schedule_id, nome, created_at
FROM old.class_professors;

-- ============================================================
-- 13. USER_SCHEDULES — schema idêntico
-- ============================================================
INSERT INTO user_schedules (id, user_id, name, is_active, is_deleted, created_at, updated_at)
SELECT id, user_id, name, is_active, is_deleted, created_at, updated_at
FROM old.user_schedules;

-- ============================================================
-- 14. USER_SCHEDULE_CLASSES — schema idêntico
-- ============================================================
INSERT INTO user_schedule_classes (id, schedule_id, class_id, color, is_visible, created_at)
SELECT id, schedule_id, class_id, color, is_visible, created_at
FROM old.user_schedule_classes;

-- ============================================================
-- 15. USER_SCHEDULE_DISCIPLINES — schema idêntico
-- ============================================================
INSERT INTO user_schedule_disciplines (id, schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at)
SELECT id, schedule_id, discipline_id, selected_class_id, is_visible, is_expanded, color, created_at
FROM old.user_schedule_disciplines;

-- ============================================================
-- 16. USER_CUSTOM_DISCIPLINES — schema idêntico
-- ============================================================
INSERT INTO user_custom_disciplines (id, schedule_id, nome, codigo, creditos_aula, creditos_trabalho, color, is_visible, created_at)
SELECT id, schedule_id, nome, codigo, creditos_aula, creditos_trabalho, color, is_visible, created_at
FROM old.user_custom_disciplines;

-- ============================================================
-- 17. USER_CUSTOM_DISCIPLINE_SCHEDULES — schema idêntico
-- ============================================================
INSERT INTO user_custom_discipline_schedules (id, custom_discipline_id, dia, horario_inicio, horario_fim, created_at)
SELECT id, custom_discipline_id, dia, horario_inicio, horario_fim, created_at
FROM old.user_custom_discipline_schedules;

-- ============================================================
-- 18. FORUM_QUESTIONS — schema idêntico
-- ============================================================
INSERT INTO forum_questions (id, titulo, conteudo, autor_id, votos, views, is_closed, created_at, updated_at, is_anonymous)
SELECT id, titulo, conteudo, autor_id, votos, views, is_closed, created_at, updated_at, is_anonymous
FROM old.forum_questions;

-- ============================================================
-- 19. FORUM_ANSWERS — schema idêntico
-- ============================================================
INSERT INTO forum_answers (id, question_id, conteudo, autor_id, votos, is_accepted, created_at, updated_at, is_anonymous)
SELECT id, question_id, conteudo, autor_id, votos, is_accepted, created_at, updated_at, is_anonymous
FROM old.forum_answers;

-- ============================================================
-- 20. FORUM_TAGS — schema idêntico
-- ============================================================
INSERT INTO forum_tags (id, nome, topico, descricao, created_by_user, approved, created_at)
SELECT id, nome, topico, descricao, created_by_user, approved, created_at
FROM old.forum_tags;

-- ============================================================
-- 21. FORUM_QUESTION_TAGS — schema idêntico
-- ============================================================
INSERT INTO forum_question_tags (question_id, tag_id)
SELECT question_id, tag_id
FROM old.forum_question_tags;

-- ============================================================
-- 22. FORUM_VOTES — schema idêntico
-- ============================================================
INSERT INTO forum_votes (id, user_id, votable_type, votable_id, vote_type, created_at)
SELECT id, user_id, votable_type, votable_id, vote_type, created_at
FROM old.forum_votes;

-- ============================================================
-- 23. PUBLIC_PROFILES — schema idêntico
-- ============================================================
INSERT INTO public_profiles (id, user_id, turma, curso_origem, area_interesse, bio, citacao, citacao_autor,
  email_publico, linkedin, lattes, github, site, banner_choice, created_at, updated_at)
SELECT id, user_id, turma, curso_origem, area_interesse, bio, citacao, citacao_autor,
  email_publico, linkedin, lattes, github, site, banner_choice, created_at, updated_at
FROM old.public_profiles;

-- ============================================================
-- 24. AREA_TAGS — schema idêntico
-- ============================================================
INSERT INTO area_tags (id, entity_type, entity_id, label, category, created_at)
SELECT id, entity_type, entity_id, label, category, created_at
FROM old.area_tags;

-- ============================================================
-- 25. ADVANCED_CYCLES — schema idêntico
-- ============================================================
INSERT INTO advanced_cycles (id, user_id, tema, orientador, coorientadores, instituto, universidade,
  semestres, ano_inicio, ano_conclusao, descricao, color, created_at, updated_at)
SELECT id, user_id, tema, orientador, coorientadores, instituto, universidade,
  semestres, ano_inicio, ano_conclusao, descricao, color, created_at, updated_at
FROM old.advanced_cycles;

-- ============================================================
-- 26. PROFILE_DISCIPLINES — schema idêntico
-- ============================================================
INSERT INTO profile_disciplines (id, user_id, codigo, nome, professor, ano, semestre, nota, avancado_id, created_at)
SELECT id, user_id, codigo, nome, professor, ano, semestre, nota, avancado_id, created_at
FROM old.profile_disciplines;

-- ============================================================
-- 27. INTERNATIONAL_EXPERIENCES — schema idêntico
-- ============================================================
INSERT INTO international_experiences (id, user_id, tipo, pais, instituicao, programa, orientador,
  descricao, ano_inicio, ano_fim, duracao_numero, duracao_unidade, created_at, updated_at)
SELECT id, user_id, tipo, pais, instituicao, programa, orientador,
  descricao, ano_inicio, ano_fim, duracao_numero, duracao_unidade, created_at, updated_at
FROM old.international_experiences;

-- ============================================================
-- 28. POST_CM_INFO — schema idêntico
-- ============================================================
INSERT INTO post_cm_info (id, user_id, tipo, instituicao, cargo, orientador, descricao,
  ano_inicio, ano_fim, github, created_at, updated_at)
SELECT id, user_id, tipo, instituicao, cargo, orientador, descricao,
  ano_inicio, ano_fim, github, created_at, updated_at
FROM old.post_cm_info;

-- ============================================================
-- 29. PROFILE_FOLLOWS — schema idêntico
-- ============================================================
INSERT INTO profile_follows (id, follower_id, following_id, created_at)
SELECT id, follower_id, following_id, created_at
FROM old.profile_follows;

-- ============================================================
-- 30. DISCIPLINE_EVALUATIONS — schema idêntico
-- ============================================================
INSERT INTO discipline_evaluations (id, discipline_id, user_id, turma_codigo, semestre,
  rating_geral, rating_dificuldade, rating_carga_trabalho, rating_professores,
  rating_clareza, rating_utilidade, rating_organizacao,
  comentario, is_anonymous, helpful_count, created_at, updated_at)
SELECT id, discipline_id, user_id, turma_codigo, semestre,
  rating_geral, rating_dificuldade, rating_carga_trabalho, rating_professores,
  rating_clareza, rating_utilidade, rating_organizacao,
  comentario, is_anonymous, helpful_count, created_at, updated_at
FROM old.discipline_evaluations;

-- ============================================================
-- 31. EVALUATION_VOTES — schema idêntico
-- ============================================================
INSERT INTO evaluation_votes (id, evaluation_id, user_id, created_at)
SELECT id, evaluation_id, user_id, created_at
FROM old.evaluation_votes;

-- ============================================================
-- 32. BOOK_EVALUATIONS — schema idêntico
-- ============================================================
INSERT INTO book_evaluations (id, book_id, user_id, rating_geral, rating_qualidade,
  rating_legibilidade, rating_utilidade, rating_precisao,
  comentario, is_anonymous, helpful_count, created_at, updated_at)
SELECT id, book_id, user_id, rating_geral, rating_qualidade,
  rating_legibilidade, rating_utilidade, rating_precisao,
  comentario, is_anonymous, helpful_count, created_at, updated_at
FROM old.book_evaluations;

-- ============================================================
-- 33. BOOK_EVALUATION_VOTES — schema idêntico
-- ============================================================
INSERT INTO book_evaluation_votes (id, evaluation_id, user_id, created_at)
SELECT id, evaluation_id, user_id, created_at
FROM old.book_evaluation_votes;

-- ============================================================
-- 34. SQLITE_SEQUENCE — manter contadores de autoincrement
-- ============================================================
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence (name, seq)
SELECT name, seq FROM old.sqlite_sequence;

-- ============================================================
-- VERIFICAÇÕES PÓS-MIGRAÇÃO
-- ============================================================

SELECT '=== VERIFICAÇÃO ===' AS info;

-- Contagem de registros
SELECT 'users' AS tabela, 
  (SELECT COUNT(*) FROM old.users) AS antigo, 
  (SELECT COUNT(*) FROM users) AS novo;

SELECT 'books' AS tabela, 
  (SELECT COUNT(*) FROM old.books) AS antigo, 
  (SELECT COUNT(*) FROM books) AS novo;

SELECT 'loans' AS tabela, 
  (SELECT COUNT(*) FROM old.loans) AS antigo, 
  (SELECT COUNT(*) FROM loans) AS novo;

SELECT 'notifications' AS tabela, 
  (SELECT COUNT(*) FROM old.notifications) AS antigo, 
  (SELECT COUNT(*) FROM notifications) AS novo;

SELECT 'disciplines' AS tabela, 
  (SELECT COUNT(*) FROM old.disciplines) AS antigo, 
  (SELECT COUNT(*) FROM disciplines) AS novo;

SELECT 'forum_questions' AS tabela, 
  (SELECT COUNT(*) FROM old.forum_questions) AS antigo, 
  (SELECT COUNT(*) FROM forum_questions) AS novo;

-- Verificar se todos os users têm status 'active'
SELECT 'users sem status active' AS check_name, 
  COUNT(*) AS count 
FROM users WHERE status != 'active';

-- Verificar se alguma subarea ficou como 'Desconhecido'
SELECT 'books com subarea Desconhecido' AS check_name, 
  COUNT(*) AS count 
FROM books WHERE subarea = 'Desconhecido';

-- Verificar se algum language ficou como 'Outro' inesperadamente
SELECT 'books por language' AS check_name, language, COUNT(*) AS count 
FROM books GROUP BY language;

-- Verificar status dos livros vs empréstimos ativos
SELECT 'livros emprestados' AS check_name, 
  (SELECT COUNT(*) FROM books WHERE status = 'emprestado') AS na_tabela_books,
  (SELECT COUNT(DISTINCT book_id) FROM loans WHERE returned_at IS NULL) AS emprestimos_ativos;

SELECT '=== MIGRAÇÃO CONCLUÍDA ===' AS info;

DETACH DATABASE old;

PRAGMA foreign_keys = ON;
