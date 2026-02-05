import { createServer } from 'http';
import app from './app.js';
import config from './config/index.js';
import { testConnection } from './db/index.js';
import { initializeSocket } from './socket.js';

const PORT = config.port;

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize WebSocket server
    const io = initializeSocket(httpServer);
    console.log('✅ WebSocket server initialized');

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${config.env} mode on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
      console.log(`📍 WebSocket: ws://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

startServer();
