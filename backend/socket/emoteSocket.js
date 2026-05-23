module.exports = (io, socket) => {
  // Broadcast floating emote reactions to the room
  socket.on('send_emoji', ({ roomId, emoji }) => {
    socket.to(roomId).emit('receive_emoji', { emoji });
  });
};
