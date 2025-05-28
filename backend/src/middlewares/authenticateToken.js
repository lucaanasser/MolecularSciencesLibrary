const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

/**
 * Middleware para autenticação de token JWT.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.warn('🟡 [authenticateToken] Token não fornecido');
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            console.error('🔴 [authenticateToken] Token inválido:', err.message);
            return res.status(403).json({ error: 'Token inválido' });
        }
        console.log('🟢 [authenticateToken] Token válido, usuário autenticado:', user);
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;