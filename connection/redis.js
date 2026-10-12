import {createClient} from 'redis';
import logger from '../utils/logger.js';
import config from '../config/config.js';

const redisClient=createClient({
  url: config.redis.url,
});

redisClient.on('error', (error)=>{
  logger.error('Redis connection error', {
    error: error.message,
  });
});

const connectRedis=async ()=>{
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  logger.info('Redis connected successfully');
};

export {redisClient, connectRedis};
