const { executeQuery, getQuery, allQuery } = require('../../../database/db');

class ProfileFollowsModel {
    /**
     * Follow a user
     * @param {Number} followerId - Follower user ID
     * @param {Number} followingId - Following user ID
     * @returns {Promise<Object>} - Created follow relationship
     */
    async follow(followerId, followingId) {
        console.log(`🔵 [ProfileFollowsModel] User ${followerId} seguindo user ${followingId}`);

        if (followerId === followingId) {
            console.error(`🔴 [ProfileFollowsModel] Usuário não pode seguir a si mesmo`);
            throw new Error('Você não pode seguir a si mesmo');
        }

        // Check if already following
        const existing = await this.isFollowing(followerId, followingId);
        if (existing) {
            console.log(`🟡 [ProfileFollowsModel] Já está seguindo`);
            return existing;
        }

        const result = await executeQuery(
            `INSERT INTO profile_follows (follower_id, following_id) VALUES (?, ?)`,
            [followerId, followingId]
        );

        console.log(`🟢 [ProfileFollowsModel] Follow criado`);
        return { id: result.lastID, follower_id: followerId, following_id: followingId };
    }

    /**
     * Unfollow a user
     * @param {Number} followerId - Follower user ID
     * @param {Number} followingId - Following user ID
     * @returns {Promise<void>}
     */
    async unfollow(followerId, followingId) {
        console.log(`🔵 [ProfileFollowsModel] User ${followerId} deixando de seguir user ${followingId}`);
        
        await executeQuery(
            `DELETE FROM profile_follows WHERE follower_id = ? AND following_id = ?`,
            [followerId, followingId]
        );

        console.log(`🟢 [ProfileFollowsModel] Follow removido`);
    }

    /**
     * Get list of users that a user is following
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Following users array with basic info
     */
    async getFollowing(userId) {
        console.log(`🔵 [ProfileFollowsModel] Buscando usuários seguidos por: ${userId}`);
        
        const following = await allQuery(
            `SELECT u.id, u.name AS nome, u.class AS turma, u.profile_image AS avatar
             FROM profile_follows pf
             JOIN users u ON pf.following_id = u.id
             WHERE pf.follower_id = ?
             ORDER BY pf.created_at DESC`,
            [userId]
        );

        console.log(`🟢 [ProfileFollowsModel] ${following.length} usuários seguidos`);
        return following;
    }

    /**
     * Get list of users following a user
     * @param {Number} userId - User ID
     * @returns {Promise<Array>} - Followers array with basic info
     */
    async getFollowers(userId) {
        console.log(`🔵 [ProfileFollowsModel] Buscando seguidores de: ${userId}`);
        
        const followers = await allQuery(
            `SELECT u.id, u.name AS nome, u.class AS turma, u.profile_image AS avatar
             FROM profile_follows pf
             JOIN users u ON pf.follower_id = u.id
             WHERE pf.following_id = ?
             ORDER BY pf.created_at DESC`,
            [userId]
        );

        console.log(`🟢 [ProfileFollowsModel] ${followers.length} seguidores`);
        return followers;
    }

    /**
     * Check if a user is following another user
     * @param {Number} followerId - Follower user ID
     * @param {Number} followingId - Following user ID
     * @returns {Promise<Object|null>} - Follow relationship or null
     */
    async isFollowing(followerId, followingId) {
        console.log(`🔵 [ProfileFollowsModel] Verificando se ${followerId} segue ${followingId}`);
        
        const follow = await getQuery(
            `SELECT * FROM profile_follows WHERE follower_id = ? AND following_id = ?`,
            [followerId, followingId]
        );

        return follow;
    }

    /**
     * Get follow counts for a user
     * @param {Number} userId - User ID
     * @returns {Promise<Object>} - { following: number, followers: number }
     */
    async getCounts(userId) {
        console.log(`🔵 [ProfileFollowsModel] Contando follows de user: ${userId}`);
        
        const followingCount = await getQuery(
            `SELECT COUNT(*) as count FROM profile_follows WHERE follower_id = ?`,
            [userId]
        );

        const followersCount = await getQuery(
            `SELECT COUNT(*) as count FROM profile_follows WHERE following_id = ?`,
            [userId]
        );

        return {
            following: followingCount.count,
            followers: followersCount.count
        };
    }
}

module.exports = new ProfileFollowsModel();
