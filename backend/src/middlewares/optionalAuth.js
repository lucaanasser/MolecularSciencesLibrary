const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação opcional.
 * Lê o header authorization; sem token define req.user = null e segue.
 * Com token, valida via jwt.verify (req.user = null se inválido, senão o payload).
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

    jwt.verify(token, SECRET, (err, user) => {
        req.user = err ? null : user;
        next();
    });
}

module.exports = optionalAuth;
