/**
 * Responsabilidade: orquestrar modulos de negocio do dominio de email.
 * Camada: service.
 * Entradas/Saidas: expoe API de envio/consulta de email para controllers e services.
 * Dependencias criticas: nodemailer e modulos internos de email.
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

const baseEmail = require('./modules/baseEmail');
const overdueEmail = require('./modules/overdueEmail');
const nudgeEmail = require('./modules/nudgeEmail');
const loanEmail = require('./modules/loanEmail');
const userLifecycleEmail = require('./modules/userLifecycleEmail');
const adminEmail = require('./modules/adminEmail');
const inboxEmail = require('./modules/inboxEmail');

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
    userLifecycleEmail,
    adminEmail,
    inboxEmail
);

module.exports = new EmailService();
