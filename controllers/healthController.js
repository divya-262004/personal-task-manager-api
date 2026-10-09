import sequelize from '../connection/database.js';
import logger from '../utils/logger.js';

export const checkHealth= async (req, res, next)=>{
  try {
    await sequelize.authenticate();

    logger.info('Health check successful', {
      database: 'connected',
    });

    res.status(200).json({
      status: 'OK',
      message: 'Application is healthy',
      database: 'connected',
    });
  } catch (error) {
    logger.error('Health check failed', {
      database: 'disconnected',
      error: error.message,
    });

    return res.status(503).json({
      status: 'DOWN',
      message: 'Application is unavailable',
      database: 'disconnected',
    });
  }
};
