const authService = require('../services/authService');

const registerUser = (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const result = authService.register(username, email, password);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const loginUser = (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const result = authService.login(username, password);
    if (!result.success) {
      return res.status(401).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const verifyAdmin = (req, res) => {
  try {
    const { code } = req.body;
    const ADMIN_CODE = '123098'; // Unified admin passcode
    if (code === ADMIN_CODE) {
      // Simulate an admin token/role
      return res.status(200).json({ success: true, role: 'admin', token: 'admin-token-mock' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid admin code' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const updateStats = (req, res) => {
  try {
    const { username, xpToAdd, finalStreak, subject } = req.body;
    const result = authService.updateStats(username, xpToAdd, finalStreak, subject);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyAdmin,
  updateStats
};
