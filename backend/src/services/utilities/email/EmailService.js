const nodemailer = require('nodemailer');
require('dotenv').config();

const baseEmail = require('./modules/baseEmail');
const overdueEmail = require('./modules/overdueEmail');
const nudgeEmail = require('./modules/nudgeEmail');
const loanEmail = require('./modules/loanEmail');
const userLifecycleEmail = require('./modules/userLifecycleEmail');

/**
 * Orquestrador de emails.
 * Delegando implementacoes para modulos de dominio.
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
}

Object.assign(
    EmailService.prototype,
    baseEmail,
    overdueEmail,
    nudgeEmail,
    loanEmail,
    userLifecycleEmail
);

module.exports = new EmailService();
