const express = require('express');
const router = express.Router();
const questionController = require('../controller/questionController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/', questionController.getQuestions);
router.post('/', questionController.createQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
