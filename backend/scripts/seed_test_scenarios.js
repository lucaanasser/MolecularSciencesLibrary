#!/usr/bin/env node
/**
 * Script para criar cenários de teste completos de empréstimos
 * Cria diversos livros e empréstimos com diferentes estados para o usuário 11
 * 
 * Cenários criados:
 * 1. Empréstimo novo (pegou hoje)
 * 2. Empréstimo com 1 renovação
 * 3. Empréstimo com 2 renovações (última renovação possível)
 * 4. Empréstimo no limite de renovações (3 renovações - pode estender)
 * 5. Empréstimo estendido (is_extended = 1)
 * 6. Empréstimo estendido e cutucado recentemente
 * 7. Empréstimo prestes a vencer (falta 1 hora)
 * 8. Empréstimo vencendo hoje (falta 1 minuto)
 * 9. Empréstimo atrasado (1 dia)
 * 10. Empréstimo muito atrasado (7 dias)
 * 11. Empréstimo dentro da janela de extensão (faltam 2 dias, pode estender)
 * 12. Empréstimo estendido com prazo longo (faltam 15 dias)
 * 13. Empréstimo estendido com prazo curto (faltam 3 dias, após nudge)
 */

require('dotenv').config();
const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL?.replace('sqlite://', '') || path.join(__dirname, '../../database/library.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados');
});

// IDs dos livros que serão criados (iniciando em 9000 para não conflitar)
const BOOK_IDS = {
    NEW_LOAN: 9001,
    ONE_RENEWAL: 9002,
    TWO_RENEWALS: 9003,
    THREE_RENEWALS: 9004,
    EXTENDED: 9005,
    EXTENDED_NUDGED: 9006,
    EXPIRES_SOON_1H: 9007,
    EXPIRES_SOON_1MIN: 9008,
    OVERDUE_1DAY: 9009,
    OVERDUE_7DAYS: 9010,
    EXTENSION_WINDOW: 9011,
    EXTENDED_LONG: 9012,
    EXTENDED_SHORT: 9013
};

const USER_ID = 3; // Usuário com NUSP 11

function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function createBook(id, title) {
    try {
        // Remove o livro se já existir
        await runQuery('DELETE FROM books WHERE id = ?', [id]);
        
        // Insere o livro de teste
        await runQuery(
            `INSERT INTO books (id, code, area, subarea, title, subtitle, authors, edition, volume, language, is_reserved) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, `TEST${id}`, 'Teste', 1, title, 'Cenário de Teste', 'Autor Teste', 1, 1, 1, 0]
        );
        console.log(`📚 Livro criado: ${title} (ID: ${id})`);
    } catch (err) {
        console.error(`❌ Erro ao criar livro ${id}:`, err.message);
    }
}

async function createLoan(bookId, scenario) {
    try {
        // Remove empréstimo existente deste livro
        await runQuery('DELETE FROM loans WHERE book_id = ?', [bookId]);
        
        const { borrowed_at, due_date, renewals, is_extended, last_nudged_at } = scenario;
        
        await runQuery(
            `INSERT INTO loans (book_id, student_id, borrowed_at, due_date, renewals, is_extended, last_nudged_at, returned_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
            [bookId, USER_ID, borrowed_at, due_date, renewals, is_extended, last_nudged_at]
        );
        
        console.log(`✅ Empréstimo criado: Livro ${bookId}, Renovações: ${renewals}, Estendido: ${is_extended}`);
    } catch (err) {
        console.error(`❌ Erro ao criar empréstimo do livro ${bookId}:`, err.message);
    }
}

function formatDateTime(date) {
    return date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}

async function main() {
    console.log('🔵 Iniciando criação de cenários de teste...\n');
    
    try {
        // Verifica se o usuário existe
        const user = await getQuery('SELECT id, name, NUSP FROM users WHERE id = ?', [USER_ID]);
        if (!user) {
            console.error(`❌ Usuário com ID ${USER_ID} não encontrado!`);
            process.exit(1);
        }
        console.log(`👤 Usuário encontrado: ${user.name} (ID: ${user.id}, NUSP: ${user.NUSP})\n`);
        
        // Limpa TODA a tabela loans primeiro
        console.log('🗑️  Limpando tabela loans...');
        await runQuery('DELETE FROM loans');
        console.log('✅ Tabela loans limpa!\n');
        
        // Busca as regras do sistema
        const rules = await getQuery('SELECT * FROM rules WHERE id = 1');
        const maxRenewals = rules?.max_renewals || 2;
        const renewalDays = rules?.renewal_days || 7;
        
        console.log(`📋 Regras: max_renewals=${maxRenewals}, renewal_days=${renewalDays}\n`);
        
        const now = new Date();
        
        // ========================================
        // CENÁRIO 1: Empréstimo novo (pegou hoje)
        // ========================================
        await createBook(BOOK_IDS.NEW_LOAN, 'Livro - Empréstimo Novo');
        await createLoan(BOOK_IDS.NEW_LOAN, {
            borrowed_at: formatDateTime(now),
            due_date: formatDateTime(new Date(now.getTime() + renewalDays * 24 * 60 * 60 * 1000)),
            renewals: 0,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 2: Empréstimo com 1 renovação
        // ========================================
        const oneRenewalBorrowed = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 dias atrás
        await createBook(BOOK_IDS.ONE_RENEWAL, 'Livro - 1 Renovação');
        await createLoan(BOOK_IDS.ONE_RENEWAL, {
            borrowed_at: formatDateTime(oneRenewalBorrowed),
            due_date: formatDateTime(new Date(now.getTime() + renewalDays * 24 * 60 * 60 * 1000)),
            renewals: 1,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 3: Empréstimo com 2 renovações (última renovação)
        // ========================================
        const twoRenewalsBorrowed = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000); // 21 dias atrás
        await createBook(BOOK_IDS.TWO_RENEWALS, 'Livro - 2 Renovações (Última)');
        await createLoan(BOOK_IDS.TWO_RENEWALS, {
            borrowed_at: formatDateTime(twoRenewalsBorrowed),
            due_date: formatDateTime(new Date(now.getTime() + renewalDays * 24 * 60 * 60 * 1000)),
            renewals: maxRenewals,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 4: Empréstimo no limite (pode estender)
        // ========================================
        const maxRenewalsBorrowed = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000); // 28 dias atrás
        const extensionWindowDue = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // vence em 2 dias
        await createBook(BOOK_IDS.THREE_RENEWALS, 'Livro - Limite Renovações (Pode Estender)');
        await createLoan(BOOK_IDS.THREE_RENEWALS, {
            borrowed_at: formatDateTime(maxRenewalsBorrowed),
            due_date: formatDateTime(extensionWindowDue),
            renewals: maxRenewals,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 5: Empréstimo estendido
        // ========================================
        const extendedBorrowed = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
        const extendedDue = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000); // vence em 21 dias
        await createBook(BOOK_IDS.EXTENDED, 'Livro - Estendido (21 dias)');
        await createLoan(BOOK_IDS.EXTENDED, {
            borrowed_at: formatDateTime(extendedBorrowed),
            due_date: formatDateTime(extendedDue),
            renewals: maxRenewals,
            is_extended: 1,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 6: Empréstimo estendido e cutucado
        // ========================================
        const extendedNudgedBorrowed = new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000);
        const extendedNudgedDue = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 dias (após nudge)
        const lastNudge = new Date(now.getTime() - 2 * 60 * 60 * 1000); // cutucado 2h atrás
        await createBook(BOOK_IDS.EXTENDED_NUDGED, 'Livro - Estendido + Cutucado');
        await createLoan(BOOK_IDS.EXTENDED_NUDGED, {
            borrowed_at: formatDateTime(extendedNudgedBorrowed),
            due_date: formatDateTime(extendedNudgedDue),
            renewals: maxRenewals,
            is_extended: 1,
            last_nudged_at: formatDateTime(lastNudge)
        });
        
        // ========================================
        // CENÁRIO 7: Empréstimo prestes a vencer (1 hora)
        // ========================================
        const expires1hBorrowed = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000);
        const expires1hDue = new Date(now.getTime() + 1 * 60 * 60 * 1000); // vence em 1 hora
        await createBook(BOOK_IDS.EXPIRES_SOON_1H, 'Livro - Vence em 1 Hora');
        await createLoan(BOOK_IDS.EXPIRES_SOON_1H, {
            borrowed_at: formatDateTime(expires1hBorrowed),
            due_date: formatDateTime(expires1hDue),
            renewals: 0,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 8: Empréstimo vencendo agora (1 minuto)
        // ========================================
        const expires1minBorrowed = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 1 * 60 * 1000);
        const expires1minDue = new Date(now.getTime() + 1 * 60 * 1000); // vence em 1 minuto
        await createBook(BOOK_IDS.EXPIRES_SOON_1MIN, 'Livro - Vence em 1 Minuto');
        await createLoan(BOOK_IDS.EXPIRES_SOON_1MIN, {
            borrowed_at: formatDateTime(expires1minBorrowed),
            due_date: formatDateTime(expires1minDue),
            renewals: 1,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 9: Empréstimo atrasado (1 dia)
        // ========================================
        const overdue1dayBorrowed = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
        const overdue1dayDue = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // atrasado 1 dia
        await createBook(BOOK_IDS.OVERDUE_1DAY, 'Livro - Atrasado 1 Dia');
        await createLoan(BOOK_IDS.OVERDUE_1DAY, {
            borrowed_at: formatDateTime(overdue1dayBorrowed),
            due_date: formatDateTime(overdue1dayDue),
            renewals: 0,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 10: Empréstimo muito atrasado (7 dias)
        // ========================================
        const overdue7daysBorrowed = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const overdue7daysDue = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // atrasado 7 dias
        await createBook(BOOK_IDS.OVERDUE_7DAYS, 'Livro - Atrasado 7 Dias');
        await createLoan(BOOK_IDS.OVERDUE_7DAYS, {
            borrowed_at: formatDateTime(overdue7daysBorrowed),
            due_date: formatDateTime(overdue7daysDue),
            renewals: 1,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 11: Na janela de extensão (2 dias)
        // ========================================
        const windowBorrowed = new Date(now.getTime() - 26 * 24 * 60 * 60 * 1000);
        const windowDue = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 dias
        await createBook(BOOK_IDS.EXTENSION_WINDOW, 'Livro - Janela de Extensão');
        await createLoan(BOOK_IDS.EXTENSION_WINDOW, {
            borrowed_at: formatDateTime(windowBorrowed),
            due_date: formatDateTime(windowDue),
            renewals: maxRenewals,
            is_extended: 0,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 12: Estendido com prazo longo (15 dias)
        // ========================================
        const extendedLongBorrowed = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
        const extendedLongDue = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        await createBook(BOOK_IDS.EXTENDED_LONG, 'Livro - Estendido Prazo Longo');
        await createLoan(BOOK_IDS.EXTENDED_LONG, {
            borrowed_at: formatDateTime(extendedLongBorrowed),
            due_date: formatDateTime(extendedLongDue),
            renewals: maxRenewals,
            is_extended: 1,
            last_nudged_at: null
        });
        
        // ========================================
        // CENÁRIO 13: Estendido prazo curto (3 dias, após nudge)
        // ========================================
        const extendedShortBorrowed = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
        const extendedShortDue = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const lastNudgeShort = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // cutucado 1 dia atrás
        await createBook(BOOK_IDS.EXTENDED_SHORT, 'Livro - Estendido Prazo Curto');
        await createLoan(BOOK_IDS.EXTENDED_SHORT, {
            borrowed_at: formatDateTime(extendedShortBorrowed),
            due_date: formatDateTime(extendedShortDue),
            renewals: maxRenewals,
            is_extended: 1,
            last_nudged_at: formatDateTime(lastNudgeShort)
        });
        
        console.log('\n✅ Todos os cenários foram criados com sucesso!');
        console.log('\n📊 Resumo dos cenários:');
        console.log('1. Empréstimo novo (hoje)');
        console.log('2. Com 1 renovação');
        console.log('3. Com 2 renovações (última)');
        console.log('4. No limite (pode estender em 2 dias)');
        console.log('5. Estendido (21 dias restantes)');
        console.log('6. Estendido + cutucado (5 dias)');
        console.log('7. Vence em 1 hora');
        console.log('8. Vence em 1 minuto');
        console.log('9. Atrasado 1 dia ⚠️');
        console.log('10. Atrasado 7 dias ⚠️⚠️');
        console.log('11. Na janela de extensão (2 dias)');
        console.log('12. Estendido prazo longo (15 dias)');
        console.log('13. Estendido prazo curto após nudge (3 dias)');
        console.log(`\n🎯 Use o usuário ID ${USER_ID} (${user.name}) para testar todos esses cenários!`);
        
    } catch (err) {
        console.error('❌ Erro ao criar cenários:', err.message);
        process.exit(1);
    } finally {
        db.close(() => {
            console.log('\n👋 Conexão com o banco fechada');
            process.exit(0);
        });
    }
}

main();
