const express = require('express');
const router = express.Router();
const subjectController = require('../controller/subjectController');
const { verifyToken } = require('../middleware/verifyToken');

router.get('/', subjectController.getSubjects);
router.post('/', subjectController.createSubject);
router.delete('/:name', subjectController.removeSubject);

router.get('/:subject/topics', subjectController.getTopicsForSubject);
router.post('/topics', subjectController.createTopic);
router.delete('/topics', subjectController.removeTopic);

module.exports = router;
