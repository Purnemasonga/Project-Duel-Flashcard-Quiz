const SubjectModel = require('../model/SubjectModel');

const getSubjects = (req, res) => {
  try {
    const subjects = SubjectModel.findAll();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getTopicsForSubject = (req, res) => {
  try {
    const { subject } = req.params;
    const list = SubjectModel.findAll();
    const subj = list.find(s => s.name.toLowerCase() === subject.toLowerCase());
    if (subj) {
      res.status(200).json(subj.subtopics || subj.topics || []);
    } else {
      res.status(404).json({ error: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createSubject = (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Subject name is required' });
    }
    const list = SubjectModel.findAll();
    if (list.find(s => s.name.toLowerCase() === name.trim().toLowerCase())) {
      return res.status(400).json({ error: 'Subject already exists' });
    }
    const created = SubjectModel.create({ name: name.trim(), topics: [], subtopics: [] });
    res.status(201).json({ success: true, subject: created });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const removeSubject = (req, res) => {
  try {
    const { name } = req.params;
    const list = SubjectModel.findAll();
    const subj = list.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (subj) {
      SubjectModel.delete(subj.id);
      res.status(200).json({ success: true, subject: subj });
    } else {
      res.status(404).json({ error: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createTopic = (req, res) => {
  try {
    const { subjectName, topicName } = req.body;
    if (!subjectName || !topicName) {
      return res.status(400).json({ error: 'Subject name and topic name are required' });
    }
    const list = SubjectModel.findAll();
    const subj = list.find(s => s.name.toLowerCase() === subjectName.trim().toLowerCase());
    if (subj) {
      SubjectModel.addSubtopic(subj.id, { name: topicName.trim() });
      const updatedSubj = SubjectModel.findById(subj.id);
      res.status(201).json({ success: true, subject: updatedSubj });
    } else {
      res.status(400).json({ error: 'Subject not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const removeTopic = (req, res) => {
  // Mock removal for now as per original code structure
  res.status(501).json({ error: 'Not implemented' });
};

module.exports = {
  getSubjects,
  getTopicsForSubject,
  createSubject,
  removeSubject,
  createTopic,
  removeTopic
};
