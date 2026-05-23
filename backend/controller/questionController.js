const questionService = require('../services/questionService');

const isAnswerLeaking = (question, answer) => {
  if (!question || !answer) return false;
  const qLower = question.toLowerCase();
  const aLower = answer.toLowerCase();
  
  const leakPatterns = [
    `(${aLower})`,
    `[${aLower}]`,
    `{${aLower}}`,
    `"${aLower}"`,
    `'${aLower}'`,
    `: ${aLower}`
  ];
  
  for (const pat of leakPatterns) {
    if (qLower.includes(pat)) {
      return true;
    }
  }
  
  if (qLower.trim() === aLower.trim()) {
    return true;
  }
  
  return false;
};

const getQuestions = (req, res) => {
  try {
    const subject = req.query.subject || req.query.topic;
    const topic = req.query.topic || 'all';
    const difficulty = req.query.difficulty || req.query.tier || 'all';
    const shuffle = req.query.shuffle !== 'false' && !req.query.subject && req.query.admin !== 'true';

    if (!subject) {
      return res.status(400).json({ error: 'Subject parameter is required' });
    }

    const playable = questionService.getPlayableQuestions(subject, topic, difficulty, shuffle);
    res.status(200).json({ questions: playable });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createQuestion = (req, res) => {
  try {
    const { subject, topic, difficulty, tier, question, text, options, correctAnswer, answer, explanation, type } = req.body;
    
    const questionStr = question || text;
    const answerStr = correctAnswer || answer;
    const diffStr = difficulty || tier || 'topic';
    const typeStr = type || (options && options.length > 0 ? 'mcq' : 'fill-in');

    if (!subject || !topic || !questionStr || !answerStr) {
      return res.status(400).json({ error: 'Subject, topic, question body, and correct answer are required' });
    }

    if (isAnswerLeaking(questionStr, answerStr)) {
      return res.status(400).json({ error: 'Validation Error: Answer leakage detected!' });
    }

    if (typeStr === 'mcq') {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'Validation Error: MCQ questions must have at least 2 options' });
      }

      const uniqueOptions = new Set(options.map(o => o.trim().toLowerCase()));
      if (uniqueOptions.size !== options.length) {
        return res.status(400).json({ error: 'Validation Error: Duplicate options are not allowed' });
      }

      if (options.some(o => !o || !o.trim())) {
        return res.status(400).json({ error: 'Validation Error: MCQ options cannot be empty' });
      }

      const hasCorrect = options.some(o => o.trim() === answerStr.trim());
      if (!hasCorrect) {
        return res.status(400).json({ error: `Validation Error: Correct answer "${answerStr}" must exactly match one of the provided options` });
      }
    }

    const created = questionService.createQuestion({
      subject,
      topic,
      difficulty: diffStr,
      tier: diffStr,
      question: questionStr,
      text: questionStr,
      options: options || [],
      correctAnswer: answerStr,
      answer: answerStr,
      explanation: explanation || '',
      type: typeStr
    });

    res.status(201).json({ success: true, question: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const { subject, topic, difficulty, tier, question, text, options, correctAnswer, answer, explanation, type } = req.body;

    const questionStr = question || text;
    const answerStr = correctAnswer || answer;
    const typeStr = type || (options && options.length > 0 ? 'mcq' : 'fill-in');

    if (questionStr && answerStr) {
      if (isAnswerLeaking(questionStr, answerStr)) {
        return res.status(400).json({ error: 'Validation Error: Answer leakage detected!' });
      }
    }

    if (typeStr === 'mcq' && options) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'Validation Error: MCQ questions must have at least 2 options' });
      }
      if (answerStr) {
        const hasCorrect = options.some(o => o.trim() === answerStr.trim());
        if (!hasCorrect) {
          return res.status(400).json({ error: `Validation Error: Correct answer "${answerStr}" must exactly match one of the provided options` });
        }
      }
    }

    const updated = questionService.editQuestion(id, {
      subject,
      topic,
      difficulty: difficulty || tier,
      tier: tier || difficulty,
      question: questionStr,
      text: questionStr,
      options,
      correctAnswer: answerStr,
      answer: answerStr,
      explanation,
      type: typeStr
    });

    if (updated) {
      res.status(200).json({ success: true, question: updated });
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteQuestion = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = questionService.removeQuestion(id);
    
    if (deleted) {
      res.status(200).json({ success: true, question: deleted });
    } else {
      res.status(404).json({ error: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
