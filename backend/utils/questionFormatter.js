/**
 * Normalizes question objects to have both database standard keys (difficulty, question, correctAnswer)
 * and legacy client-facing keys (tier, text, answer, type) to ensure gameplay never breaks.
 */
const { shuffleOptions } = require('./shuffleOptions');

const formatQuestion = (q, shuffle = true) => {
  if (!q) return null;
  
  const questionText = q.question || q.text || 'Flashcard Duel study question';
  const correctAnswerText = q.correctAnswer || q.answer || '';
  const diff = q.difficulty || q.tier || 'topic';
  const type = q.type || (q.options && q.options.length > 0 ? 'mcq' : 'fill-in');
  
  let options = q.options || [];
  if (shuffle && type === 'mcq' && options.length > 0) {
    options = shuffleOptions(options);
  }
  
  return {
    id: q.id || Math.floor(Math.random() * 100000),
    subject: q.subject || 'General Study',
    topic: q.topic || 'General Topic',
    difficulty: diff,
    tier: diff,
    question: questionText,
    text: questionText,
    options: options,
    correctAnswer: correctAnswerText,
    answer: correctAnswerText,
    explanation: q.explanation || 'Consult textbook reference materials to review this topic.',
    type,
    createdBy: q.createdBy || 'system',
    createdAt: q.createdAt || new Date()
  };
};

module.exports = {
  formatQuestion
};
