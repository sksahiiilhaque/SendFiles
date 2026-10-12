import { createApp } from './app.js';
import { config } from './config/index.js';
import { getDatabase } from './config/database.js';
import { cleanupService } from './services/cleanupService.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // 1. Initialize Database
    getDatabase();

    // 2. Start Periodic Background Cleanup Worker
    cleanupService.startPeriodicCleanup(15); // runs every 15 minutes

    // 3. Create and Start Express Application
    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`=========================================`);
      logger.info(` SendFiles Backend Server Running!      `);
      logger.info(` URL: http://localhost:${config.port}   `);
      logger.info(` Storage Mode: ${config.storageProvider.toUpperCase()} `);
      logger.info(` Max File Size: 5 GB                    `);
      logger.info(` Environment: ${config.nodeEnv}         `);
      logger.info(`=========================================`);
    });

    // 4. Start Free-Tier Keep-Alive Self-Ping (Prevents free hosts from sleeping)
    if (config.selfPingUrl) {
      logger.info(`Starting keep-alive self-ping for ${config.selfPingUrl} (every ${config.selfPingIntervalMinutes} mins)`);
      setInterval(async () => {
        try {
          const pingRes = await fetch(config.selfPingUrl);
          logger.debug(`Keep-alive self-ping response: ${pingRes.status}`);
        } catch (err) {
          logger.warn(`Keep-alive self-ping warning: ${err.message}`);
        }
      }, config.selfPingIntervalMinutes * 60 * 1000);
    }

    // Graceful Shutdown
    const shutdown = () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

startServer();
