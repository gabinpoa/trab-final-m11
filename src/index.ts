import { startServer } from './app';
import { StorageCleanupService } from './shared/services/storageCleanup.service';
import prisma from './shared/config/database';

console.log('Starting server...');

const server = startServer();

console.log('Server started, keeping process alive...');

// Iniciar serviço de limpeza automática de storage
StorageCleanupService.startScheduledCleanup();

// Keep the process alive indefinitely
setInterval(() => {
  // Heartbeat to keep process alive
}, 60000);

// Graceful shutdown (requisito do DevOps para deploys)
const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      console.error('Error closing server:', err);
      process.exit(1);
    }

    console.log('Server closed');

    // Disconnect from database
    try {
      await prisma.$disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Error disconnecting database:', error);
    }

    console.log('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
