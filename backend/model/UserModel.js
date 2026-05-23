const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/users.json');

const readData = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeData = (data) => {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
};

const UserModel = {
  findAll: () => readData(),
  findById: (id) => readData().find(user => user.id === id),
  findByEmail: (email) => readData().find(user => user.email === email),
  create: (userData) => {
    const users = readData();
    const newUser = {
      id: Date.now().toString(),
      xp: 0,
      streak: 0,
      wins: 0,
      matchesPlayed: 0,
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeData(users);
    return newUser;
  },
  update: (id, updates) => {
    const users = readData();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    writeData(users);
    return users[index];
  },
  delete: (id) => {
    const users = readData();
    const filtered = users.filter(user => user.id !== id);
    if (users.length === filtered.length) return false;
    writeData(filtered);
    return true;
  }
};

module.exports = UserModel;
