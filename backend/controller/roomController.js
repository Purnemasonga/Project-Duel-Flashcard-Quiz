const multiplayerService = require('../services/multiplayerService');

const getRoomQuestions = (req, res) => {
  try {
    const { roomId } = req.params;
    const questions = multiplayerService.getRoomQuestionsByCode(roomId);
    
    if (questions && questions.length > 0) {
      res.status(200).json({ questions });
    } else {
      res.status(404).json({ error: 'Room or synchronized questions not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getRoomQuestions
};
