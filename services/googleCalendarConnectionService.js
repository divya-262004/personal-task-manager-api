import {
  Task,
  GoogleCalendarConnection,
} from '../models/index.js';
import sequelize from '../connection/database.js';
import {
  encryptGoogleToken,
  decryptGoogleToken,
} from '../utils/googleTokenEncryption.js';
import AppError from '../utils/AppError.js';
import googleOAuthClient from '../connection/googleOAuth.js';
import {clearTaskCache} from '../utils/cache.js';

import logger from '../utils/logger.js';

const saveGoogleTokens = async (userId, tokens) => {
  try {
    const parsedUserId = Number(userId);

    if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    if (!tokens || typeof tokens !== 'object') {
      throw new AppError('Invalid Google token response', 502);
    }

    const connection = await GoogleCalendarConnection.findOne({
      where: {userId: parsedUserId},
    });

    if (
      typeof tokens.refresh_token !== 'string' ||
      !tokens.refresh_token
    ) {
      if (connection) {
        return;
      }

      throw new AppError(
          'Google did not provide a refresh token. Please reconnect.',
          502,
      );
    }

    const encryptedRefreshToken = encryptGoogleToken(
        tokens.refresh_token,
    );

    if (connection) {
      await connection.update({
        refreshToken: encryptedRefreshToken,
      });

      return;
    }

    await GoogleCalendarConnection.create({
      userId: parsedUserId,
      refreshToken: encryptedRefreshToken,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to save Google Calendar connection',
        500,
    );
  }
};

const disconnectGoogle = async (userId) => {
  try {
    const parsedUserId = Number(userId);

    if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    const connection = await GoogleCalendarConnection.findOne({
      where: {userId: parsedUserId},
    });

    if (!connection) {
      return;
    }

    let refreshToken=null;

    try {
      refreshToken = decryptGoogleToken(connection.refreshToken);
    } catch {
      logger.warn('Unable to decrypt Google token during disconnect', {
        userId: parsedUserId,
      });
    }

    await sequelize.transaction(async (transaction)=>{
      await Task.update({
        googleEventId: null,
        googleSyncStatus: 'not_synced',
        googleSyncError: null,
      },
      {
        where: {userId: parsedUserId},
        transaction,
      },
      );
      await connection.destroy({transaction});
    });

    await clearTaskCache(parsedUserId);

    if (refreshToken) {
      try {
        await googleOAuthClient.revokeToken(refreshToken);
      } catch {
        logger.warn('Google token revocation failed during disconnect', {
          userId: parsedUserId,
        });
      }
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to disconnect Google Calendar',
        500,
    );
  }
};

export {
  saveGoogleTokens,
  disconnectGoogle,
};
