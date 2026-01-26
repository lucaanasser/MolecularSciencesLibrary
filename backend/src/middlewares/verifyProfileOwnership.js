/**
 * Middleware to verify that the authenticated user owns the profile being accessed/modified
 * Extracts userId from req.params and compares with req.user.id
 * Returns 403 Forbidden if user is not the owner
 */
const verifyProfileOwnership = (req, res, next) => {
    const { userId } = req.params;
    const authenticatedUserId = req.user?.id;

    console.log(`🔵 [verifyProfileOwnership] Verificando propriedade - User: ${authenticatedUserId}, Profile: ${userId}`);

    // Check if userId param exists
    if (!userId) {
        console.error('🔴 [verifyProfileOwnership] userId não fornecido nos parâmetros');
        return res.status(400).json({ error: 'userId é obrigatório' });
    }

    // Check if user is authenticated
    if (!authenticatedUserId) {
        console.error('🔴 [verifyProfileOwnership] Usuário não autenticado');
        return res.status(401).json({ error: 'Autenticação necessária' });
    }

    // Verify ownership
    if (parseInt(userId, 10) !== parseInt(authenticatedUserId, 10)) {
        console.error(`🔴 [verifyProfileOwnership] Acesso negado - User ${authenticatedUserId} tentou acessar perfil ${userId}`);
        return res.status(403).json({ error: 'Você não tem permissão para modificar este perfil' });
    }

    console.log(`🟢 [verifyProfileOwnership] Propriedade verificada com sucesso`);
    next();
};

module.exports = verifyProfileOwnership;
