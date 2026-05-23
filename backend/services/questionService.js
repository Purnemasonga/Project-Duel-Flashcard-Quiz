const QuestionModel = require('../model/QuestionModel');
const SubjectModel = require('../model/SubjectModel');
const { getFallbackQuestions } = require('./fallbackQuestionService');
const { formatQuestion } = require('../utils/questionFormatter');

const getPlayableQuestions = (subject, topic, difficulty = 'all', shuffle = true) => {
  if (!subject) return [];

  const subjectLower = subject.toLowerCase();
  const topicLower = topic ? topic.toLowerCase() : null;
  const diffLower = difficulty ? difficulty.toLowerCase() : 'all';

  const allQs = QuestionModel.findAll();

  let filtered = allQs.filter(q => {
    const matchesSubject = (q.subject && q.subject.toLowerCase() === subjectLower) ||
                           (q.topic && q.topic.toLowerCase() === subjectLower);
    
    let matchesTopic = true;
    if (topicLower && topicLower !== 'all') {
      matchesTopic = (q.topic && q.topic.toLowerCase() === topicLower) ||
                     (q.subject && q.subject.toLowerCase() === topicLower);
    }

    let matchesTier = true;
    if (diffLower && diffLower !== 'all' && diffLower !== 'topic') {
      matchesTier = (q.tier && q.tier.toLowerCase() === diffLower) || (q.difficulty && q.difficulty.toLowerCase() === diffLower);
    }

    return matchesSubject && matchesTopic && matchesTier;
  });

  if (filtered.length === 0) {
    const fallbackList = getFallbackQuestions(subject, topic || subject, difficulty);
    fallbackList.forEach(q => {
      createQuestion(q);
    });
    filtered = fallbackList;
  }

  let questionsToReturn = filtered;
  if (shuffle) {
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    questionsToReturn = shuffled.slice(0, 10);
  }

  return questionsToReturn.map(q => formatQuestion(q, shuffle));
};

const createQuestion = (questionData) => {
  const newQ = QuestionModel.create(questionData);
  
  if (newQ.subject && newQ.topic) {
    const subjects = SubjectModel.findAll();
    const subj = subjects.find(s => s.name.toLowerCase() === newQ.subject.toLowerCase());
    if (subj) {
      const hasTopic = subj.subtopics?.find(t => t.name.toLowerCase() === newQ.topic.toLowerCase());
      if (!hasTopic) {
        SubjectModel.addSubtopic(subj.id, { name: newQ.topic });
      }
    }
  }
  
  return formatQuestion(newQ);
};

const editQuestion = (id, questionData) => {
  const updated = QuestionModel.update(id, questionData);
  return updated ? formatQuestion(updated) : null;
};

const removeQuestion = (id) => {
  const removed = QuestionModel.delete(id);
  return removed ? { id } : null; // return id on success
};

module.exports = {
  getPlayableQuestions,
  createQuestion,
  editQuestion,
  removeQuestion
};
