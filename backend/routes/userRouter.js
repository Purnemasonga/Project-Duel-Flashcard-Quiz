const express = require('express');
const router = express.Router();
const UserModel = require('../model/UserModel');

router.get('/leaderboard', (req, res) => {
  try {
    const users = UserModel.findAll();
    const sorted = users.sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 50);
    res.status(200).json({ success: true, leaderboard: sorted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/profile/:username', (req, res) => {
  try {
    const { username } = req.params;
    const users = UserModel.findAll();
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
