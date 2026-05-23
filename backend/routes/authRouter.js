const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/admin', authController.verifyAdmin);
router.post('/stats/update', authController.updateStats);

module.exports = router;
