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
    initializeSocket(httpServer);
    console.log('✅ WebSocket server initialized');

    // Start listening on all network interfaces (0.0.0.0)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server running in ${config.env} mode on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 Network: http://192.168.2.169:${PORT}/api`);
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
