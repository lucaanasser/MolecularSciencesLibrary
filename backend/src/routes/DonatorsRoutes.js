const express = require('express');
const DonatorsController = require('../controllers/DonatorsController');
const router = express.Router();

router.post('/', DonatorsController.addDonator);
router.delete('/:id', DonatorsController.removeDonator);
router.get('/', DonatorsController.getAllDonators);
router.get('/:id', DonatorsController.getDonatorById);
router.get('/filter', DonatorsController.getFilteredDonators);

module.exports = router;
