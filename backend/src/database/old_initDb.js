SQLite format 3@  NJ1N.r;
tablebadgesbadges
                 CREATE TABLE badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            image_locked TEXT NOT NULL, -- Caminho ou URL da imagem do badge bloqueado
            image_unlocked TEXT NOT NULL, -- Caminho ou URL da imagem do badge desbloqueado
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )+
          ?indexsqlite_autoindex_badges_1badges

                                                utablerulesrules
CREATE TABLE rules (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            max_days INTEGER NOT NULL DEFAULT 7,
            overdue_reminder_days INTEGER NOT NULL DEFAULT 3,
            max_books_per_user INTEGER NOT NULL DEFAULT 5,
            max_renewals INTEGER NOT NULL DEFAULT 2,
            renewal_days INTEGER NOT NULL DEFAULT 7,
            extension_window_days INTEGER NOT NULL DEFAULT 3, -- janela (dias) antes do vencimento para liberar extensão
            extension_block_multiplier INTEGER NOT NULL DEFAULT 3, -- multiplicador (renewal_days * multiplier)
            shortened_due_days_after_nudge INTEGER NOT NULL DEFAULT 5, -- prazo mínimo após nudge em fase estendida
            nudge_cooldown_hours INTEGER NOT NULL DEFAULT 24, -- intervalo entre nudges permitidos
            pending_nudge_extension_days INTEGER NOT NULL DEFAULT 5 -- NOVO
        ''Ktablenotificationsnotifications      CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'overdue', 'nudge', etc
            message TEXT NOT NULL,
            metadata TEXT,
            loan_id INTEGER, -- vínculo direto com empréstimo para nudges
            status TEXT DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )c%tableloansloanCREATE TABLE loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            returned_at TIMESTAMP,
            renewals INTEGER NOT NULL DEFAULT 0, 
            due_date TIMESTAMP, 
            is_extended INTEGER NOT NULL DEFAULT 0, -- 0 normal, 1 estendido
            last_nudged_at TIMESTAMP, -- último nudge que impactou
            FOREIGN KEY(book_id) REFERENCES books(id)
            FOREIGN KEY(user_id) REFERENCES users(id)
        )}YtablebooksbooksCREATE TABLE books (
            id INTEGER UNIQUE PRIMARY KEY,
            code TEXT NOT NULL, 
            area TEXT NOT NULL,
            subarea TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            authors TEXT NOT NULL,
            edition INTEGER NOT NULL,
            volume INTEGER,
            language TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'disponível' -- "disponível", "emprestado", "reservado", "indisponível"
        ))=indexsqlite_autoindex_books_1booksP++Ytablesqlite_sequencesqlite_sequenceCREATE TABLE sqlite_sequence(name,seq)`tableusersusersCREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            NUSP INTEGER NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            password_hash TEXT, -- Agora permite NULL
            role TEXT NOT NULL, -- 'admin', 'aluno', 'proaluno'
            profile_image TEXT, -- Caminho da imagem de perfil
            class TEXT, -- Número da turma
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'active' -- 'active', 'pending'
        ))=indexsqlite_autoindex_users_2users)=indexsqlite_a4.-*"&

3Pro Alunoproaluno@biblioteca.com$2b$10$xFxYktLOCuqe094PNyZQTuguB3ajPaLFgbcsDF/hDfwmPgNhO9ir.proaluno2026-03-03Administradoradmin@biblioteca.com$2b$10$PrLg2dQJQionoB6NLLt/q.Jy73yvoC/2RIzvVPHfmUKAEYAQCmSxaadmin2026-03-07 14:52:55active

proalunousersioteca.com5badges/virtual_bookshelf.com

__-Iae3Leitor FrequenteVocê já fez 10 empréstimos./images/badges/leitor_frequente_locked.png/images/badges/leitor_frequente_unlocked.png2026-03-07 14:52:54
-       Leitor Frequente
?


\S%
tablebadgesbadges
                 CREATE TABLE badg
tablebadgesbadges
                 CREATE TABLE badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            image_locked TEXT NOT NULL, -- Caminho ou URL da imagem do badge bloqueado
            image_unlocked TEXT NOT NULL, -- Caminho ou URL da imagem do badge desbloqueado
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
                utablerulesrules
CREATE TABLE rules (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            max_days INTEGER NOT NULL DEFAULT 7,
            overdue_reminder_days INTEGER NOT NULL DEFAULT 3,
            max_books_per_user INTEGER NOT NULL DEFAULT 5,
            max_renewals INTEGER NOT NULL DEFAULT 2,
            renewal_days INTEGER NOT NULL DEFAULT 7,
            extension_window_days INTEGER NOT NULL DEFAULT 3, -- janela (dias) antes do vencimento para liberar extensão
            extension_block_multiplier INTEGER NOT NULL DEFAULT 3, -- multiplicador (renewal_days * multiplier)
            shortened_due_days_after_nudge INTEGER NOT NULL DEFAULT 5, -- prazo mínimo após nudge em fase estendida
            nudge_cooldown_hours INTEGER NOT NULL DEFAULT 24, -- intervalo entre nudges permitidos
            pending_nudge_extension_days INTEGER NOT NULL DEFAULT 5 -- NOVO
        ''Ktablenotificationsnotifications      CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL, -- 'overdue', 'nudge', etc
            message TEXT NOT NULL,
            metadata TEXT,
            loan_id INTEGER, -- vínculo direto com empréstimo para nudges
            status TEXT DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )c%tableloansloanCREATE TABLE loans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            returned_at TIMESTAMP,
            renewals INTEGER NOT NULL DEFAULT 0, 
            due_date TIMESTAMP, 
            is_extended INTEGER NOT NULL DEFAULT 0, -- 0 normal, 1 estendido
            last_nudged_at TIMESTAMP, -- último nudge que impactou
            FOREIGN KEY(book_id) REFERENCES books(id)
            FOREIGN KEY(user_id) REFERENCES users(id)
        )}YtablebooksbooksCREATE TABLE books (
            id INTEGER UNIQUE PRIMARY KEY,
            code TEXT NOT NULL, 
            area TEXT NOT NULL,
            subarea TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            authors TEXT NOT NULL,
            edition INTEGER NOT NULL,
            volume INTEGER,
            language TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'disponível' -- "disponível", "emprestado", "reservado", "indisponível"
        ))=indexsqlite_autoindex_books_1booksP++Ytablesqlite_sequencesqlite_sequenceCREATE TABLE sqlite_sequence(name,seq)`tableusersusersCREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            NUSP INTEGER NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            password_hash TEXT, -- Agora permite NULL
            role TEXT NOT NULL, -- 'admin', 'aluno', 'proaluno'
            profile_image TEXT, -- Caminho da imagem de perfil
            class TEXT, -- Número da turma
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'active' -- 'active', 'pending'
        ))=indexsqlite_autoindex_users_2users)=indexsqlite_autoindex_users_1users
h
dXXO
    sm))tableuser_schedulesuser_schedulesCREATE TABLE user_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL DEFAULT 'Plano 1',
            is_active INTEGER DEFAULT 1,
            is_deleted INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )}11%tablediscipline_classesdiscipline_classesCREATE TABLE discipline_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discipline_id INTEGER NOT NULL,
            codigo_turma TEXT NOT NULL,
            codigo_turma_teorica TEXT,
            tipo TEXT,
            inicio DATE,
            fim DATE,
            observacoes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE
        )##MtabledisciplinesdisciplinesCREATE TABLE disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE NOT NULL,
            nome TEXT NOT NULL,
            unidade TEXT,
            campus TEXT,
            creditos_aula INTEGER DEFAULT 0,
            creditos_trabalho INTEGER DEFAULT 0,
            has_valid_classes INTEGER DEFAULT 0,
            is_postgrad INTEGER DEFAULT 0,
            ementa TEXT,
            objetivos TEXT,
            conteudo_programatico TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//Gtablevirtual_bookshelfvirtual_bookshelfCREATE TABLE virtual_bookshelf (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shelf_number INTEGER NOT NULL,
            shelf_row INTEGER NOT NULL,
            book_code_start TEXT,
            book_code_end TEXT,
            UNIQUE(shelf_number, shelf_row)
        )AU/indexsqlite_autoindex_virtual_bookshelf_1virtual_bookshelf
s
CREATE TABLE donators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            book_id INTEGER,
            donation_type TEXT NOT NULL, -- 'book' ou 'money'
            amount REAL,
            contact TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(book_id) REFERENCES books(id)
        )+
          ?indexsqlite_autoindex_badges_1badges
                                               tablebadgesbadges
                                                                CREATE TABLE badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            image_locked TEXT NOT NULL, -- Caminho ou URL da imagem do badge bloqueado
            image_unlocked TEXT NOT NULL, -- Caminho ou URL da imagem do badge desbloqueado
      m))tableuser_schedulesuser_schedulesCREATE TABLE user_sY--etableclass_professorsclass_professorsCREATE TABLE class_professors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            schedule_id INTEGER,
            nome TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE,
            FOREIGN KEY(schedule_id) REFERENCES class_schedules(id) ON DELETE CASCADE
        ).++tableclass_schedulesclass_schedulesCREATE TABLE class_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_id INTEGER NOT NULL,
            dia TEXT NOT NULL,
            horario_inicio TEXT NOT NULL,
            horario_fim TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE
}si_ULB8.$



Kzskc[SK



\
 

~MMotableuser_custom_discipline_schedulesuser_custom_discipline_schedulesCREATE TABLE user_custom_discipline_schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            custom_discipline_id INTEGER NOT NULL,
            dia TEXT NOT NULL,
            horario_inicio TEXT NOT NULL,
            horario_fim TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(custom_discipline_id) REFERENCES user_custom_disciplines(id) ON DELETE CASCADE
        )/;;utableuser_custom_disciplinesuser_custom_disciplinesCREATE TABLE user_custom_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            nome TEXT NOT NULL,
            codigo TEXT,
            creditos_aula INTEGER,
            creditos_trabalho INTEGER,
            color TEXT DEFAULT '#14b8a6',
            is_visible INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE
        )??;tableuser_schedule_disciplinesuser_schedule_disciplinesCREATE TABLE user_schedule_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            discipline_id INTEGER NOT NULL,
            selected_class_id INTEGER,
            is_visible INTEGER DEFAULT 1,
            is_expanded INTEGER DEFAULT 0,
            color TEXT DEFAULT '#14b8a6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE,
            FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE,
            FOREIGN KEY(selected_class_id) REFERENCES discipline_classes(id) ON DELETE SET NULL,
            UNIQUE(schedule_id, discipline_id)
        )Qe?indexsqlite_autoindex_user_schedule_disciplines_1user_schedule_disciplines
7gtableuser_schedule_classesuser_schedule_classesCREATE TABLE user_schedule_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            color TEXT DEFAULT '#14b8a6',
            is_visible INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(schedule_id) REFERENCES user_schedules(id) ON DELETE CASCADE,
            FOREIGN KEY(class_id) REFERENCES discipline_classes(id) ON DELETE CASCADE
        )))tableuser_schedulesuser_schedulesCREATE TABLE user_schedules (
            id INTEGER PRIMARY3G!indexsqlite_autoindex_forum_tags_1forum_tagstableforum_answersforum_answersCREATE TABLE forum_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            conteudo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            votos INTEGER DEFAULT 0,
            is_accepted INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_anonymous INTEGER DEFAULT 0,
            FOREIGN KEY(question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
            FOREIGN KEY(autor_id) REFERENCES users(id) ON DELETE CASCADE
        )R++[tableforum_questionsforum_questionsCREATE TABLE forum_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            conteudo TEXT NOT NULL,
            autor_id INTEGER NOT NULL,
            votos INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            is_closed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_anonymous INTEGER DEFAULT 0,
            FOREIGN KEY(autor_id) REFERENCES users(id) ON DELETE CASCADE
        )





~'?&++5tableadvanced_cyclesadvanced_cycles+CREATE TABLE advanced_cycles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tema TEXT NOT NULL,
            orientador TEXT NOT NULL,
            coorientadores TEXT,
            instituto TEXT,
            universidade TEXT,
            semestres INTEGER DEFAULT 4,
            ano_inicio INTEGER,
            ano_conclusao INTEGER,
            descricao TEXT,
            color TEXT DEFAULT '#14b8a6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )"++stablepublic_profilespublic_profiles'CREATE TABLE public_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            turma TEXT,
            curso_origem TEXT,
            area_interesse TEXT,
            bio TEXT,
            citacao TEXT,
            citacao_autor TEXT,
            email_publico TEXT,
            linkedin TEXT,
            lattes TEXT,
            github TEXT,
            site TEXT,
            banner_choice TEXT DEFAULT 'purple' CHECK(banner_choice IN ('purple', 'blue', 'green', 'red', 'orange', 'yellow')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )=#Q+indexsqlite_autoindex_public_profiles_1public_profiles( ##tableforum_votesforum_votes%CREATE TABLE forum_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            votable_type TEXT NOT NULL CHECK(votable_type IN ('question', 'answer')),
            votable_id INTEGER NOT NULL,
            vote_type INTEGER NOT NULL CHECK(vote_type IN (-1, 1)),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, votable_type, votable_id),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )5!I#indexsqlite_autoindex_forum_votes_1forum_votes&33'tableforum_question_tagsforum_question_tags#CREATE TABLE forum_question_tags (
            question_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (question_id, tag_id),
            FOREIGN KEY(question_id) REFERENCES forum_questions(id) ON DELETE CASCADE,
            FOREIGN KEY(tag_id) REFERENCES forum_tags(id) ON DELETE CASCADE
        )EY3indexsqlite_autoindex_forum_question_tags_1forum_question_tags$3G!indexsqlite_autoindex_forum_tags_1forum_tags!E!!Utableforum_tagsforum_tags CREATE TABLE forum_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            topico TEXT NOT NULL DEFAULT 'geral',
            descricao TEXT,
            created_by_user INTEGER,
            approved INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(created_by_user) REFERENCES users(id) ON DELETE SET NULL
        )~%55indexidx_area_tags_entityarea_tags*CREATE INDEX idx_area_tags_entity 
        ON area_tags(entity_type, entity_id)
    7$=tablearea_tagsarea_tags)CREATE TABLE area_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL CHECK(entity_type IN ('profile', 'advanced_cycle', 'post_cm')),
            entity_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            category TEXT NOT NULL CHECK(category IN ('grande-area', 'area', 'subarea')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )




=+Q+indexsqlite_autoindex_profile_follows_1profile_follows1
0)%%#tablepost_cm_infopost_cm_info/CREATE TABLE post_cm_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('trabalho', 'pos-graduacao', 'nova-graduacao', 'retorno-curso-origem', 'outro')),
            instituicao TEXT NOT NULL,
            cargo TEXT,
            orientador TEXT,
            descricao TEXT,
            ano_inicio INTEGER,
            ano_fim INTEGER,
            github TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )W(??=tableinternational_experiencesinternational_experiences.CREATE TABLE international_experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tipo TEXT NOT NULL CHECK(tipo IN ('intercambio', 'estagio', 'pesquisa', 'curso', 'outro')),
            pais TEXT NOT NULL,
            instituicao TEXT NOT NULL,
            programa TEXT,
            orientador TEXT,
            descricao TEXT,
            ano_inicio INTEGER NOT NULL,
            ano_fim INTEGER,
            duracao_numero INTEGER,
            duracao_unidade TEXT CHECK(duracao_unidade IN ('dias', 'semanas', 'meses', 'anos')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
         '33?tableprofile_disciplinesprofile_disciplines,CREATE TABLE profile_disciplines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            codigo TEXT NOT NULL,
            nome TEXT NOT NULL,
            professor TEXT,
            ano INTEGER NOT NULL,
            semestre INTEGER NOT NULL CHECK(semestre IN (1, 2)),
            nota TEXT,
            avancado_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(avancado_id) REFERENCES advanced_cycles(id) ON DELETE SET NULL
        )Y++5tableadvanced_cyclesadvanced_cycles+CREATE TABLE advanced_cycles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            tema TEXT NOT NULL,
            orientador TEXT NOT NULL,
            coorientadores TEXT,
            instituto TEXT,
            universidade TEXT,
            semestres INTEGER DEFAULT 4,
            ano_inicio INTEGER,
            ano_conclusao INTEGER,
            descricao TEXT,
            color TEXT DEFAULT '#14b8a6',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )~%55indexidx_area_tags_entityarea_tags*CREATE INDEX idx_area_tags_entK-_9indexsqlite_autoindex_discipline_evaluations_1discipline_evaluations3_*++utableprofile_followsprofile_follows0CREATE TABLE profile_follows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, following_id),
            FOREIGN KEY(follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(following_id) REFERENCES users(id) ON DELETE CASCADE
        )

        b      nnI3]7indexsqlite_autoindex_book_evaluation_votes_1book_evaluation_votes:b0--wtablebook_evaluationsbook_evaluations7CREATE TABLE book_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating_geral REAL CHECK (rating_geral IS NULL OR (rating_geral >= 0.5 AND rating_geral <= 5.0)),
            rating_qualidade REAL CHECK (rating_qualidade IS NULL OR (rating_qualidade >= 0.5 AND rating_qualidade <= 5.0)),
            rating_legibilidade REAL CHECK (rating_legibilidade IS NULL OR (rating_legibilidade >= 0.5 AND rating_legibilidade <= 5.0)),
            rating_utilidade REAL CHECK (rating_utilidade IS NULL OR (rating_utilidade >= 0.5 AND rating_utilidade <= 5.0)),
            rating_precisao REAL CHECK (rating_precisao IS NULL OR (rating_precisao >= 0.5 AND rating_precisao <= 5.0)),
            comentario TEXT,
            is_anonymous INTEGER DEFAULT 0,
            helpful_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(book_id, user_id)
        )?1S-indexsqlite_autoindex_book_evaluations_1book_evaluations8j.--tableevaluation_votesevaluation_votes5CREATE TABLE evaluation_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evaluation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(evaluation_id) REFERENCES discipline_evaluations(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(evaluation_id, user_id)
        )IS-indexsqlite_autoindex_evaluation_votes_1evaluation_votesK-_9indexsqlite_autoindex_discipline_evaluations_1discipline_evaluations3\,99Stablediscipline_evaluationsdiscipline_evaluations2CREATE TABLE discipline_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discipline_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            turma_codigo TEXT,
            semestre TEXT,
            rating_geral REAL CHECK (rating_geral IS NULL OR (rating_geral >= 0.5 AND rating_geral <= 5.0)),
            rating_dificuldade REAL CHECK (rating_dificuldade IS NULL OR (rating_dificuldade >= 0.5 AND rating_dificuldade <= 5.0)),
            rating_carga_trabalho REAL CHECK (rating_carga_trabalho IS NULL OR (rating_carga_trabalho >= 0.5 AND rating_carga_trabalho <= 5.0)),
            rating_professores REAL CHECK (rating_professores IS NULL OR (rating_professores >= 0.5 AND rating_professores <= 5.0)),
            rating_clareza REAL CHECK (rating_clareza IS NULL OR (rating_clareza >= 0.5 AND rating_clareza <= 5.0)),
            rating_utilidade REAL CHECK (rating_utilidade IS NULL OR (rating_utilidade >= 0.5 AND rating_utilidade <= 5.0)),
            rating_organizacao REAL CHECK (rating_organizacao IS NULL OR (rating_organizacao >= 0.5 AND rating_organizacao <= 5.0)),
            comentario TEXT,
            is_anonymous INTEGER DEFAULT 0,
            helpful_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(discipline_id) REFERENCES disciplines(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(discipline_id, user_id)
        )=+Q+indexsqlite_autoindex_profile_follows_1profile_follows1




XXaSGlvSB=7ndexidx_book_eval_votes_userbook_evaluation_votesJCREATE INDEX idx_book_eval_votes_user ON book_evaluation_votes(user_id)AI73indexidx_book_eval_votes_evaluationbook_evaluation_votesICREATE INDEX idx_book_eval_votes_evaluation ON book_evaluation_votes(evaluation_id)
@E-/indexidx_book_evaluations_helpfulbook_evaluationsHCREATE INDEX idx_book_evaluations_helpful ON book_evaluations(helpful_count DESC)y??-indexidx_book_evaluations_userbook_evaluationsGCREATE INDEX idx_book_evaluations_user ON book_evaluations(user_id)y>?-indexidx_book_evaluations_bookbook_evaluationsFCREATE INDEX idx_book_evaluations_book ON book_evaluations(book_id)b=)-}indexidx_votes_userevaluation_votesECREATE INDEX idx_votes_user ON evaluation_votes(user_id)u<5-indexidx_votes_evaluationevaluation_votesDCREATE INDEX idx_votes_evaluation ON evaluation_votes(evaluation_id)
                                ;;91indexidx_evaluations_helpfuldiscipline_evaluationsCCREATE INDEX idx_evaluations_helpful ON discipline_evaluations(helpful_count DESC){:59indexidx_evaluations_userdiscipline_evaluations9A9-indexidx_evaluations_disciplinediscipline_evaluationsACREATE INDEX idx_evaluations_discipline ON discipline_evaluations(discipline_id)|8;#'indexidx_forum_votes_votableforum_votes@CREATE INDEX idx_forum_votes_votable ON forum_votes(votable_type, votable_id)y7A'indexidx_forum_answers_questionforum_answers?CREATE INDEX idx_forum_answers_question ON forum_answers(question_id)z6?+indexidx_forum_questions_votosforum_questions>CREATE INDEX idx_forum_questions_votos ON forum_questions(votos DESC)5C+%indexidx_forum_questions_createdforum_questions=CREATE INDEX idx_forum_questions_created ON forum_questions(created_at DESC)x4?+indexidx_forum_questions_autorforum_questions<CREATE INDEX idx_forum_questions_autor ON forum_questions(autor_id)I3]7indexsqlite_autoindex_book_evaluation_votes_1book_evaluation_votes:s277tablebook_evaluation_votesbook_evaluation_votes9CREATE TABLE book_evaluation_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evaluation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(evaluation_id) REFERENCES book_evaluations(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(evaluation_id, user_id)
        )?1S-indexsqlite_autoindex_book_evaluations_1book_evaluations8b0--wtablebook_evaluationsbook_evaluations7CREATE TABLE book_evaluations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating_geral REAL CHECK (rating_geral IS NULL OR (rating_geral >= 0.5 AND rating_geral <= 5.0)),
            rating_qualidade REAL CHECK (rating_qualidade IS NULL OR (rating_qualidade >= 0.5 AND rating_qualidade <= 5.0)),
            rating_legibilidade REAL CHECK (rating_legibilidade IS NULL OR (rating_legibilidade >= 0.5 AND rating_legibilidade <= 5.0)),
            rating_utilidade REAL CHECK (rating_utilidade IS NULL OR (rating_utilidade >= 0.5 AND rating_utilidade <= 5.0)),
            rating_precisao REAL CHECK (rating_precisao IS NULL OR (rating_precisao >= 0.5 AND rating_precisao <= 5.0)),
            comentario TEXT,
            is_anonymous INTEGER DEFAULT 0,
            helpful_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(book_id, user_id)
        )?/S-indexsqlite_autoindex_evaluation_votes_1evaluation_votes6
