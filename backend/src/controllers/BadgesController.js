const BadgesService = require('../services/BadgesService');

const BadgesController = {
    async list(req, res) {
        try {
            const badges = await BadgesService.getAllBadges();
            res.json(badges);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getById(req, res) {
        try {
            const badge = await BadgesService.getBadgeById(req.params.id);
            if (!badge) return res.status(404).json({ error: 'Badge não encontrado' });
            res.json(badge);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async create(req, res) {
        try {
            const { name, description, image_locked, image_unlocked } = req.body;
            if (!name || !image_locked || !image_unlocked) {
                return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
            }
            const badgeId = await BadgesService.createBadge({ name, description, image_locked, image_unlocked });
            res.status(201).json({ id: badgeId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = BadgesController;