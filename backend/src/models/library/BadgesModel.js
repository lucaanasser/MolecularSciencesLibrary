const { executeQuery, getQuery, allQuery } = require('../../database/db');

class BadgesModel {
    async createBadge({ name, description, image_locked, image_unlocked }) {
        return await executeQuery(
            `INSERT INTO badges (name, description, image_locked, image_unlocked) VALUES (?, ?, ?, ?)`,
            [name, description, image_locked, image_unlocked]
        );
    }

    async getAllBadges() {
        return await allQuery(`SELECT * FROM badges`);
    }

    async getBadgeById(id) {
        return await getQuery(`SELECT * FROM badges WHERE id = ?`, [id]);
    }

    async getBadgeByName(name) {
        return await getQuery(`SELECT * FROM badges WHERE name = ?`, [name]);
    }
}

module.exports = new BadgesModel();