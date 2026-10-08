import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import config from './config/config.js';
import swaggerSpec from './config/swagger.js';
import sequelize from './connection/database.js';

import authRoutes from './routes/authRoutes.js';
import errorMiddleWare from './middleware/errorMiddleWare.js';
import taskRoutes from './routes/taskRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';

import logger from './utils/logger.js';

const app=express();
app.use(helmet());

const PORT=config.port;

app.use(cors());
app.use(express.json());

app.use('/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
);

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Personal Task Manager API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/tasks', taskRoutes);

app.use('/auth', googleAuthRoutes);
app.use(errorMiddleWare);

const startServer = async () => {
  try {
    await sequelize.authenticate();

    logger.info('Database connected successfully');

    app.listen(PORT, () => logger.info(`server running at port ${PORT}`));
  } catch (error) {
    logger.error('Database connection failed: ', {
      error: error.message,
    });
  }
};

startServer();
