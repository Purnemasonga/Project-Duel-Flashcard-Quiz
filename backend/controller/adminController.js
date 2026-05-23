const SubjectModel = require('../model/SubjectModel');
const QuestionModel = require('../model/QuestionModel');
const UserModel = require('../model/UserModel');
const RoomModel = require('../model/RoomModel');

const getStats = (req, res) => {
  const io = req.app.get('io');
  const activeSockets = io ? io.engine.clientsCount : 0;
  res.status(200).json({
    activeSockets,
    totalStudents: UserModel.findAll().length,
    databaseQuestions: QuestionModel.findAll().length,
    matchesToday: RoomModel.findAll().length
  });
};

const importCsvQuestions = (req, res) => {
  try {
    const { csvData, subjectName } = req.body;
    if (!csvData || !subjectName) {
      return res.status(400).json({ error: 'csvData and subjectName are required' });
    }

    const lines = csvData.split('\n');
    let injected = 0;
    const newQuestions = [];

    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 2) {
        const questionText = parts[0].trim();
        const correctAnswer = parts[1].trim();
        
        if (questionText && correctAnswer) {
          const options = parts.slice(2).map(o => o.trim()).filter(Boolean);
          newQuestions.push({
            subject: subjectName,
            topic: 'CSV Import',
            difficulty: 'topic',
            tier: 'topic',
            type: options.length > 1 ? 'mcq' : 'fill-in',
            question: questionText,
            text: questionText,
            options,
            correctAnswer,
            answer: correctAnswer,
            explanation: 'CSV Imported flashcard.'
          });
          injected++;
        }
      }
    });

    if (newQuestions.length > 0) {
      QuestionModel.insertMany(newQuestions);
    }
    res.status(200).json({ success: true, injected });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const generateAiDeck = (req, res) => {
  try {
    const { topic, difficulty, subjectName } = req.body;
    if (!topic || !subjectName) {
      return res.status(400).json({ error: 'Topic and subjectName are required' });
    }

    const mockQuestions = [
      {
        type: 'mcq',
        question: `Under high volume situations, how does the system optimize ${topic} request handling?`,
        options: ['By utilizing concurrent event queues', 'By shutting down execution ports', 'By clearing system registers', 'By using static script bundles'],
        correctAnswer: 'By utilizing concurrent event queues',
        explanation: 'Concurrent event queues maintain asynchronous processing bounds under heavy traffic.'
      },
      {
        type: 'fill-in',
        question: `To guarantee secure access to a ${topic} environment, developers utilize dynamic cryptographic ____ tokens.`,
        correctAnswer: 'bearer',
        explanation: 'Bearer tokens allow clients to authorize requests without sending username/password credentials every time.'
      }
    ];

    const newQuestions = mockQuestions.map(q => ({
      subject: subjectName,
      topic,
      difficulty: difficulty || 'topic',
      tier: difficulty || 'topic',
      type: q.type,
      question: `[AI GENERATED] ${q.question}`,
      text: `[AI GENERATED] ${q.question}`,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      answer: q.correctAnswer,
      explanation: q.explanation,
      createdBy: 'ai-generator'
    }));
    
    QuestionModel.insertMany(newQuestions);
    res.status(201).json({ success: true, count: newQuestions.length, questions: newQuestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getStats,
  importCsvQuestions,
  generateAiDeck
};
