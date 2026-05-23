module.exports = (io, socket) => {
  // Sync Score/Lives/Match progression telemetry between contestants
  socket.on('match_score_sync', ({ roomId, username, score, lives, currentIdx }) => {
    socket.to(roomId).emit('opponent_score_sync', { username, score, lives, currentIdx });
  });

  // Signal countdown and transition sync to active contestants
  socket.on('start_match_countdown', ({ roomId }) => {
    io.to(roomId).emit('match_countdown_start');
  });
};
