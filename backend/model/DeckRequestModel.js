const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/deckRequests.json');

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

const DeckRequestModel = {
  findAll: () => readData(),
  
  create: (requestData) => {
    const requests = readData();
    const newRequest = {
      id: Date.now().toString(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requests.push(newRequest);
    writeData(requests);
    return newRequest;
  },
  
  update: (id, updates) => {
    const requests = readData();
    const index = requests.findIndex(req => req.id === id);
    if (index === -1) return null;
    requests[index] = { ...requests[index], ...updates };
    writeData(requests);
    return requests[index];
  },
  
  delete: (id) => {
    const requests = readData();
    const filtered = requests.filter(req => req.id !== id);
    if (requests.length === filtered.length) return false;
    writeData(filtered);
    return true;
  }
};

module.exports = DeckRequestModel;
