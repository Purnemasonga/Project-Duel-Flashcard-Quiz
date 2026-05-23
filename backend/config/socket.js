const { Server } = require('socket.io');
const registerRoomHandlers = require('../socket/roomSocket');
const registerGameplayHandlers = require('../socket/gameplaySocket');
const registerEmoteHandlers = require('../socket/emoteSocket');

/**
 * Initializes and configures Socket.io, registering all event sub-modules.
 */
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`WebSocket Client Connected: ${socket.id}`);

    // Register modular action handlers
    registerRoomHandlers(io, socket);
    registerGameplayHandlers(io, socket);
    registerEmoteHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`WebSocket Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocket;
