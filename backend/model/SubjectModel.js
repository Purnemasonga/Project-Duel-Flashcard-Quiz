const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/subjects.json');

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

const SubjectModel = {
  findAll: () => readData(),
  findById: (id) => readData().find(s => s.id === id),
  create: (subjectData) => {
    const subjects = readData();
    const newSubject = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      subtopics: [],
      ...subjectData,
      createdAt: new Date().toISOString()
    };
    subjects.push(newSubject);
    writeData(subjects);
    return newSubject;
  },
  update: (id, updates) => {
    const subjects = readData();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) return null;
    subjects[index] = { ...subjects[index], ...updates };
    writeData(subjects);
    return subjects[index];
  },
  delete: (id) => {
    const subjects = readData();
    const filtered = subjects.filter(s => s.id !== id);
    if (subjects.length === filtered.length) return false;
    writeData(filtered);
    return true;
  },
  addSubtopic: (subjectId, subtopicData) => {
    const subjects = readData();
    const index = subjects.findIndex(s => s.id === subjectId);
    if (index === -1) return null;
    
    const newSubtopic = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...subtopicData
    };
    
    if (!subjects[index].subtopics) subjects[index].subtopics = [];
    subjects[index].subtopics.push(newSubtopic);
    writeData(subjects);
    return newSubtopic;
  }
};

module.exports = SubjectModel;
