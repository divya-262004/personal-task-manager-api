import {randomBytes} from 'node:crypto';

import {redisClient} from '../connection/redis.js';
import AppError from '../utils/AppError.js';

const STATE_KEY_PREFIX='google-calendar:oauth-state:';
const STATE_TTL_SECONDS=10*60;

const createOAuthState=async (userId)=>{
  try {
    const parsedUserId=Number(userId);

    if (!Number.isSafeInteger(parsedUserId) ||
            parsedUserId<=0
    ) {
      throw new AppError('Invalid authenticated user', 401);
    }

    const state=randomBytes(32).toString('base64url');

    const result=await redisClient.set(
        `${STATE_KEY_PREFIX}${state}`,
        String(parsedUserId),
        {
          EX: STATE_TTL_SECONDS,
          NX: true,
        },
    );

    if (result !=='OK') {
      throw new AppError(
          'Unable to create Google OAuth state',
          503,
      );
    }

    return state;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to start Google authorization',
        503,
    );
  }
};

const consumeOAuthState= async (state)=>{
  if (typeof state !== 'string' || state.length!==43) {
    return null;
  }

  try {
    const userId=await redisClient.getDel(`${STATE_KEY_PREFIX}${state}`);

    if (userId===null) {
      return null;
    }

    const parsedUserId=Number(userId);

    if (!Number.isSafeInteger(parsedUserId) ||
            parsedUserId<=0
    ) {
      return null;
    }

    return parsedUserId;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to validate Google OAuth state',
        503,
    );
  }
};

export {
  createOAuthState,
  consumeOAuthState,
};
