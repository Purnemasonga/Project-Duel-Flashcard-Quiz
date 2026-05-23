const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/rooms.json');

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

const RoomModel = {
  findAll: () => readData(),
  findById: (id) => readData().find(r => r.id === id),
  findByRoomCode: (roomCode) => readData().find(r => r.roomCode === roomCode),
  create: (roomData) => {
    const rooms = readData();
    const newRoom = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      players: [],
      questions: [],
      status: 'waiting',
      ...roomData,
      createdAt: new Date().toISOString()
    };
    rooms.push(newRoom);
    writeData(rooms);
    return newRoom;
  },
  update: (id, updates) => {
    const rooms = readData();
    const index = rooms.findIndex(r => r.id === id);
    if (index === -1) return null;
    rooms[index] = { ...rooms[index], ...updates };
    writeData(rooms);
    return rooms[index];
  },
  delete: (id) => {
    const rooms = readData();
    const filtered = rooms.filter(r => r.id !== id);
    if (rooms.length === filtered.length) return false;
    writeData(filtered);
    return true;
  }
};

module.exports = RoomModel;
