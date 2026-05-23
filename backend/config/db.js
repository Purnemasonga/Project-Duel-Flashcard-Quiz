const { subjectsConfig: initialSubjects, seedQuestions } = require('../data/sampleDecks');

// In-Memory Database Store
const users = new Map(); // username -> user details
const rooms = new Map(); // roomId -> room details
let subjects = [...initialSubjects];
const questions = seedQuestions();

// USER COLLECTION METHODS
const getUsers = () => Array.from(users.values());
const getUser = (username) => users.get(username);
const saveUser = (username, userData) => {
  users.set(username, userData);
  return userData;
};
const updateUserStats = (username, xpToAdd, finalStreak) => {
  if (users.has(username)) {
    const user = users.get(username);
    user.xp += xpToAdd;
    if (finalStreak > user.streak) {
      user.streak = finalStreak;
    }
    users.set(username, user);
    return user;
  }
  return null;
};

// ROOM COLLECTION METHODS
const getRooms = () => rooms;
const getRoom = (roomId) => rooms.get(roomId);
const saveRoom = (roomId, roomData) => {
  rooms.set(roomId, roomData);
  return roomData;
};
const deleteRoom = (roomId) => rooms.delete(roomId);

// SUBJECT COLLECTION METHODS
const getSubjects = () => subjects;
const addSubject = (name) => {
  if (name && !subjects.find(s => s.name.toLowerCase() === name.toLowerCase())) {
    const newSubj = { name, topics: [] };
    subjects.push(newSubj);
    return newSubj;
  }
  return null;
};
const deleteSubject = (name) => {
  const index = subjects.findIndex(s => s.name.toLowerCase() === name.toLowerCase());
  if (index !== -1) {
    const removed = subjects[index];
    subjects = subjects.filter(s => s.name.toLowerCase() !== name.toLowerCase());
    return removed;
  }
  return null;
};
const addTopicToSubject = (subjectName, topicName) => {
  const subj = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
  if (subj && topicName && !subj.topics.includes(topicName)) {
    subj.topics.push(topicName);
    return subj;
  }
  return null;
};
const deleteTopicFromSubject = (subjectName, topicName) => {
  const subj = subjects.find(s => s.name.toLowerCase() === subjectName.toLowerCase());
  if (subj) {
    subj.topics = subj.topics.filter(t => t !== topicName);
    return subj;
  }
  return null;
};

// QUESTION COLLECTION METHODS
const getQuestions = () => questions;
const addQuestion = (qData) => {
  const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
  const newQ = {
    id: newId,
    subject: qData.subject,
    topic: qData.topic,
    tier: qData.tier || qData.difficulty || 'topic',
    difficulty: qData.difficulty || qData.tier || 'topic',
    type: qData.type || 'mcq',
    text: qData.text || qData.question,
    question: qData.question || qData.text,
    options: qData.options || [],
    answer: qData.answer || qData.correctAnswer,
    correctAnswer: qData.correctAnswer || qData.answer,
    explanation: qData.explanation || '',
    createdBy: qData.createdBy || 'admin',
    createdAt: new Date()
  };
  questions.push(newQ);
  return newQ;
};
const updateQuestion = (id, qData) => {
  const idx = questions.findIndex(q => q.id.toString() === id.toString());
  if (idx !== -1) {
    const original = questions[idx];
    const updated = {
      ...original,
      subject: qData.subject || original.subject,
      topic: qData.topic || original.topic,
      tier: qData.tier || qData.difficulty || original.tier,
      difficulty: qData.difficulty || qData.tier || original.difficulty,
      type: qData.type || original.type,
      text: qData.text || qData.question || original.text,
      question: qData.question || qData.text || original.question,
      options: qData.options || original.options,
      answer: qData.answer || qData.correctAnswer || original.answer,
      correctAnswer: qData.correctAnswer || qData.answer || original.correctAnswer,
      explanation: qData.explanation !== undefined ? qData.explanation : original.explanation
    };
    questions[idx] = updated;
    return updated;
  }
  return null;
};
const deleteQuestion = (id) => {
  const idx = questions.findIndex(q => q.id.toString() === id.toString());
  if (idx !== -1) {
    const removed = questions[idx];
    questions.splice(idx, 1);
    return removed;
  }
  return null;
};

module.exports = {
  // Users
  getUsers,
  getUser,
  saveUser,
  updateUserStats,
  
  // Rooms
  getRooms,
  getRoom,
  saveRoom,
  deleteRoom,
  
  // Subjects
  getSubjects,
  addSubject,
  deleteSubject,
  addTopicToSubject,
  deleteTopicFromSubject,
  
  // Questions
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion
};
