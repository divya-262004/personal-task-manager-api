import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import config from './config/config.js';
import swaggerSpec from './config/swagger.js';

import sequelize from './connection/database.js';
import {connectRedis} from './connection/redis.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorMiddleWare from './middleware/errorMiddleWare.js';
import taskRoutes from './routes/taskRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import taskReminderRoutes from './routes/taskReminderRoutes.js';

import logger from './utils/logger.js';

import startTaskAttachmentCleanupJob from './jobs/taskAttachmentCleanupJob.js';
import startTaskReminderJob from './jobs/taskReminderJob.js';
import startTaskDigestJob from './jobs/taskDigestJob.js';

const app=express();

app.use(helmet());

const PORT=config.port;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);

app.use('/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
);

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/auth', googleAuthRoutes);
app.use('/', taskReminderRoutes);

app.use(errorMiddleWare);

const startServer = async () => {
  try {
    await sequelize.authenticate();

    logger.info('Database connected successfully');

    await connectRedis();
    startTaskAttachmentCleanupJob();
    startTaskReminderJob();
    startTaskDigestJob();

    app.listen(PORT, () => logger.info(`server running at port ${PORT}`));
  } catch (error) {
    logger.error('Database connection failed: ', {
      error: error.message,
    });
    process.exit(1);
  }
};

startServer();
