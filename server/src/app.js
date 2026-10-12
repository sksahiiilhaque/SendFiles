import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config/index.js';
import transferRoutes from './routes/transferRoutes.js';
import localUploadRoutes from './routes/localUploadRoutes.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  // Basic security and trust proxy
  app.set('trust proxy', 1);

  // CORS configuration
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps or curl) or in allowed list
        if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS policy'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-sender-token', 'Range'],
      exposedHeaders: ['ETag', 'Content-Disposition', 'Content-Range', 'Accept-Ranges'],
      credentials: true
    })
  );

  // Request logger in development
  if (config.nodeEnv !== 'production') {
    app.use((req, res, next) => {
      if (!req.url.includes('/api/local-storage/upload-part')) {
        logger.debug(`${req.method} ${req.url}`);
      }
      next();
    });
  }

  // General rate limiter
  app.use('/api', generalApiLimiter);

  // Body parser for JSON metadata
  app.use(express.json({ limit: '2mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'SendFiles API',
      storageProvider: config.storageProvider,
      maxFileSizeGb: config.maxFileSizeBytes / (1024 * 1024 * 1024),
      time: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/transfers', transferRoutes);
  app.use('/api/local-storage', localUploadRoutes);

  // Serve built static frontend for single-service free deployment (Render, Fly, VPS, etc.)
  const clientDist = path.resolve(process.cwd(), 'client/dist');
  if (fs.existsSync(clientDist)) {
    logger.info(`Serving static frontend build from ${clientDist}`);
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
