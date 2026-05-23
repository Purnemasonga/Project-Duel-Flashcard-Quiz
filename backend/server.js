const http = require('http');
const app = require('./app');
const initSocket = require('./config/socket');

const server = http.createServer(app);

// Initialize modular WebSocket setup and store reference in App context
const io = initSocket(server);
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('=============================================');
  console.log(`🎮 FLASHCARD DUEL MODULAR SERVER BOOTED`);
  console.log(`🚀 Listening on port: ${PORT}`);
  console.log('=============================================');
});
module.exports = { server, io };
