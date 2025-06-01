const express = require('express');
const router = express.Router();
const BadgesController = require('../controllers/BadgesController');

router.get('/', BadgesController.list);
router.get('/:id', BadgesController.getById);
router.post('/', BadgesController.create);

module.exports = router;