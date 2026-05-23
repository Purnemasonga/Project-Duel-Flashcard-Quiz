const RoomModel = require('../model/RoomModel');
const { getPlayableQuestions } = require('./questionService');
const { generateRoomCode } = require('../utils/generateRoomCode');

const createRoom = (hostSocketId, subject = 'all', tier = 'all') => {
  const roomCode = generateRoomCode();
  const newRoom = RoomModel.create({
    roomCode,
    players: [hostSocketId],
    status: 'waiting',
    subject,
    tier
  });
  return newRoom;
};

const joinRoom = (roomCode, playerSocketId) => {
  const room = RoomModel.findByRoomCode(roomCode);
  if (!room) return null;

  if (room.players.length >= 2) return null; // Room full

  room.players.push(playerSocketId);

  if (room.players.length === 2) {
    room.status = 'active';
    const syncedQuestions = getPlayableQuestions(room.subject, 'all', room.tier);
    room.questions = syncedQuestions;
  }

  RoomModel.update(room.id, room);
  return room;
};

const getRoomQuestionsByCode = (roomCode) => {
  const room = RoomModel.findByRoomCode(roomCode);
  if (room) {
    if (!room.questions || room.questions.length === 0) {
      room.questions = getPlayableQuestions(room.subject || 'General Study', 'all', room.tier || 'all');
      RoomModel.update(room.id, room);
    }
    return room.questions;
  }
  return getPlayableQuestions('General Study', 'all', 'all');
};

const getRoomQuestionsById = (roomId) => {
  const room = RoomModel.findById(roomId);
  if (room) {
    if (!room.questions || room.questions.length === 0) {
      room.questions = getPlayableQuestions(room.subject || 'General Study', 'all', room.tier || 'all');
      RoomModel.update(room.id, room);
    }
    return room.questions;
  }
  return getPlayableQuestions('General Study', 'all', 'all');
};

module.exports = {
  createRoom,
  joinRoom,
  getRoomQuestionsByCode,
  getRoomQuestionsById
};
