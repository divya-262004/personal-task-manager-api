import {RateLimiterRedis} from 'rate-limiter-flexible';
import {redisClient} from '../connection/redis.js';
import AppError from '../utils/AppError.js';

const createRateLimiter = (windowMs, maxRequests) => {
  const rateLimiter= new RateLimiterRedis({
    storeClient: redisClient,
    useRedisPackage: true,
    keyPrefix: 'rate-limit-login',
    points: maxRequests,
    duration: windowMs,
  });

  return async (req, res, next)=>{
    try {
      await rateLimiter.consume(req.ip);
      return next();
    } catch (error) {
      if (error.remainingPoints!==undefined) {
        return next(
            new AppError('Too many requests. Please try again later.', 429),
        );
      }

      next(error);
    }
  };
};

export default createRateLimiter;
