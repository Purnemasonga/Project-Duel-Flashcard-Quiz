const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../data/questions.json');

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

const QuestionModel = {
  findAll: () => readData(),
  findById: (id) => readData().find(q => q.id === id),
  findBySubjectId: (subjectId) => readData().filter(q => q.subjectId === subjectId),
  findBySubjectAndSubtopic: (subjectId, subtopicId) => readData().filter(q => q.subjectId === subjectId && q.subtopicId === subtopicId),
  create: (questionData) => {
    const questions = readData();
    const newQuestion = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...questionData,
      createdAt: new Date().toISOString()
    };
    questions.push(newQuestion);
    writeData(questions);
    return newQuestion;
  },
  insertMany: (questionsArray) => {
    const questions = readData();
    const newQuestions = questionsArray.map(q => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      ...q,
      createdAt: new Date().toISOString()
    }));
    questions.push(...newQuestions);
    writeData(questions);
    return newQuestions;
  },
  update: (id, updates) => {
    const questions = readData();
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return null;
    questions[index] = { ...questions[index], ...updates };
    writeData(questions);
    return questions[index];
  },
  delete: (id) => {
    const questions = readData();
    const filtered = questions.filter(q => q.id !== id);
    if (questions.length === filtered.length) return false;
    writeData(filtered);
    return true;
  }
};

module.exports = QuestionModel;
