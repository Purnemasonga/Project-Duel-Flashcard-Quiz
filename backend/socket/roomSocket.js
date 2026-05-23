const multiplayerService = require('../services/multiplayerService');

module.exports = (io, socket) => {
  socket.on('create_room', ({ subject, tier } = {}) => {
    const newRoom = multiplayerService.createRoom(socket.id, subject, tier);
    const roomId = newRoom.roomCode;
    
    socket.join(roomId);
    socket.emit('room_created', roomId);
    console.log(`Lobby Created: Room ${roomId} | Subject: ${subject || 'all'} | Tier: ${tier || 'all'}`);
  });

  socket.on('join_room', (roomId) => {
    const room = multiplayerService.joinRoom(roomId, socket.id);
    
    if (room) {
      socket.join(roomId);
      // Emit room joined event to all sockets in the room room
      io.to(roomId).emit('room_joined', roomId);
      console.log(`Socket ${socket.id} joined Room ${roomId}`);
    } else {
      socket.emit('error', 'Lobby Room not found');
    }
  });
};
