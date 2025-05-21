const usersService = require('../services/UsersService');

class UsersController {
    async createUser(req, res) {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password || !role) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            const user = await usersService.createUser({ name, email, password, role });
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async authenticateUser(req, res) {
        try {
            const { email, NUSP, password } = req.body;
            // Permitir login por email OU NUSP
            if ((!email && !NUSP) || !password) {
                return res.status(400).json({ error: 'Email ou NUSP e senha são obrigatórios.' });
            }
            const user = await usersService.authenticateUser(email || NUSP, password);
            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await usersService.getUserById(id);
            res.status(200).json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await usersService.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteUserById(req, res) {
        try {
            const { id } = req.params;
            await usersService.deleteUserById(id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UsersController();