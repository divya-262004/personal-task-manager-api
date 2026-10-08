import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import helmet from 'helmet';

import config from './config/config.js';
import swaggerSpec from './config/swagger.js';
import sequelize from './connection/database.js';

import authRoutes from './routes/authRoutes.js';
import errorMiddleWare from './middleware/errorMiddleWare.js';
import taskRoutes from './routes/taskRoutes.js';
import logger from './utils/logger.js';

const app=express();
app.use(helmet());
app.use(cors());
const PORT=config.port;

app.use(express.json());

app.use('/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
);

app.use('/auth', authRoutes);

app.get('/', (req, res)=>{
  res.status(200).json({
    status: 'ok',
    service: 'Personal Task Manager API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/tasks', taskRoutes);

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
