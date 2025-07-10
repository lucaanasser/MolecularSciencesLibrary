const DonatorsService = require('../services/DonatorsService');

const DonatorsController = {
    async addDonator(req, res) {
        try {
            const id = await DonatorsService.addDonator(req.body);
            res.status(201).json({ id });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async removeDonator(req, res) {
        try {
            await DonatorsService.removeDonator(req.params.id);
            res.status(204).end();
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async getAllDonators(req, res) {
        try {
            const donators = await DonatorsService.getAllDonators();
            res.json(donators);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async getDonatorById(req, res) {
        try {
            const donator = await DonatorsService.getDonatorById(req.params.id);
            if (!donator) return res.status(404).json({ error: 'Donator not found' });
            res.json(donator);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async getFilteredDonators(req, res) {
        try {
            const { isUser, donationType, name } = req.query;
            const filters = {
                isUser: isUser !== undefined ? isUser === 'true' : undefined,
                donationType,
                name
            };
            const donators = await DonatorsService.getFilteredDonators(filters);
            res.json(donators);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};

module.exports = DonatorsController;
