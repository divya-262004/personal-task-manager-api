import AppError from '../utils/AppError.js';

import {
  getGoogleAuthorizationUrl,
  exchangeGoogleCode,
} from '../services/googlecalenderService.js';
import {
  createOAuthState,
  consumeOAuthState,
} from '../services/googleOAuthStateService.js';
import {
  saveGoogleTokens,
  disconnectGoogle,
} from '../services/googleCalendarConnectionService.js';
import {
  syncExistingTasksWithGoogleCalendar,
} from '../services/taskService.js';

import logger from '../utils/logger.js';

const googleAuthController = async (req, res, next) => {
  try {
    const state = await createOAuthState(req.userId);
    const authorizationUrl = getGoogleAuthorizationUrl(state);

    return res.status(200).json({
      authUrl: authorizationUrl,
    });
  } catch (error) {
    return next(error);
  }
};

const googleAuthCallbackController = async (req, res, next) => {
  try {
    const {
      code,
      state,
      error: googleError,
    } = req.query;

    if (googleError) {
      throw new AppError(
          'Google Calendar authorization was denied',
          400,
      );
    }

    if (
      typeof code !== 'string' ||
      typeof state !== 'string'
    ) {
      throw new AppError(
          'Invalid Google authorization callback',
          400,
      );
    }

    const userId = await consumeOAuthState(state);

    if (userId === null) {
      throw new AppError(
          'Invalid or expired OAuth state',
          400,
      );
    }

    const tokens = await exchangeGoogleCode(code);

    await saveGoogleTokens(userId, tokens);

    let existingTasksSync;

    try {
      existingTasksSync=await syncExistingTasksWithGoogleCalendar(userId);
    } catch (syncError) {
      logger.warn('Unable to start existing task synchronization', {
        userId,
        status: syncError.statusCode || 'unknown',
      });

      existingTasksSync ={
        message: 'Existing task synchronization could not be started',
      };
    }

    return res.status(200).json({
      message: 'Google Calendar connected successfully',
      existingTasksSync,
    });
  } catch (error) {
    return next(error);
  }
};

const disconnectGoogleAccount = async (req, res, next)=>{
  try {
    await disconnectGoogle(req.userId);

    return res.status(200).json({
      message: 'Google Calendar disconnected successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export {
  googleAuthController,
  googleAuthCallbackController,
  disconnectGoogleAccount,
};
