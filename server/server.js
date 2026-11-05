const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Optional real-time messaging using Socket.IO
let io;
try {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Handle new message broadcast
    socket.on('send_message', (data) => {
      if (data && data.conversationId) {
        io.to(data.conversationId).emit('receive_message', data);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  // Attach io to app for access in controllers if needed
  app.set('io', io);
  console.log('Socket.IO real-time engine initialized.');
} catch (e) {
  console.log('Running REST-based messaging mode.');
}

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` BookLoop Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Listening on port: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Keep server running in development
});
