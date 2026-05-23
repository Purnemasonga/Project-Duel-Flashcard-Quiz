const UserModel = require('../model/UserModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

const register = (username, email, password) => {
  const existingUser = UserModel.findByEmail(email);
  if (existingUser) {
    return { success: false, message: 'Email already registered' };
  }
  
  const existingUsername = UserModel.findAll().find(u => u.username === username);
  if (existingUsername) {
    return { success: false, message: 'Username already taken' };
  }

  // In a real app, hash password here. We just store it for this prototype.
  const newUser = UserModel.create({
    username,
    email,
    password, // Plain text for local dev prototype
    role: 'student'
  });

  const token = generateToken(newUser.id);
  const { password: _password, ...userWithoutPassword } = newUser;

  return { success: true, token, user: userWithoutPassword };
};

const login = (username, password) => {
  const user = UserModel.findAll().find(u => u.username === username);
  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid credentials' };
  }

  const token = generateToken(user.id);
  const { password: _password, ...userWithoutPassword } = user;

  return { success: true, token, user: userWithoutPassword };
};

const updateStats = (username, xpToAdd, finalStreak, subject = null) => {
  const users = UserModel.findAll();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const newXp = (user.xp || 0) + xpToAdd;
  const newStreak = Math.max((user.streak || 0), finalStreak);
  
  const playedSubjects = user.playedSubjects || [];
  if (subject && !playedSubjects.includes(subject)) {
    playedSubjects.push(subject);
  }
  
  const updatedUser = UserModel.update(user.id, { 
    xp: newXp, 
    streak: newStreak, 
    matchesPlayed: (user.matchesPlayed || 0) + 1,
    playedSubjects 
  });
  const { password: _password, ...userWithoutPassword } = updatedUser;
  
  return { success: true, user: userWithoutPassword };
};

module.exports = {
  register,
  login,
  updateStats
};
