const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/stats', adminController.getStats);
router.post('/import-csv', adminController.importCsvQuestions);
router.post('/generate-deck', adminController.generateAiDeck);

module.exports = router;
