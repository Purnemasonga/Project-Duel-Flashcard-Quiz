const DeckRequestModel = require('../model/DeckRequestModel');

const createDeckRequest = (req, res) => {
  try {
    const { studentName, deckName, topic, message } = req.body;
    
    if (!studentName || !deckName || !topic) {
      return res.status(400).json({ success: false, message: 'Student Name, Deck Name, and Topic are required' });
    }
    
    const newRequest = DeckRequestModel.create({
      studentName,
      deckName,
      topic,
      message: message || ''
    });
    
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create deck request', error: error.message });
  }
};

const getAllRequests = (req, res) => {
  try {
    const requests = DeckRequestModel.findAll();
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch deck requests', error: error.message });
  }
};

const updateRequestStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const updatedRequest = DeckRequestModel.update(id, { status });
    if (!updatedRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update request', error: error.message });
  }
};

const deleteRequest = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = DeckRequestModel.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete request', error: error.message });
  }
};

module.exports = {
  createDeckRequest,
  getAllRequests,
  updateRequestStatus,
  deleteRequest
};
