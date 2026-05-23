const express = require('express');
const router = express.Router();
const roomController = require('../controller/roomController');

router.get('/:roomId/questions', roomController.getRoomQuestions);

module.exports = router;
