import {google} from 'googleapis';
import {OAuth2Client} from 'google-auth-library';
import {createHash} from 'node:crypto';

import config from '../config/config.js';
import {GoogleCalendarConnection} from '../models/index.js';
import {decryptGoogleToken} from '../utils/googleTokenEncryption.js';
import AppError from '../utils/AppError.js';

const getGoogleCalendarClient = async (userId) => {
  const parsedUserId = Number(userId);

  if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  try {
    const connection = await GoogleCalendarConnection.findOne({
      where: {userId: parsedUserId},
    });

    if (!connection) {
      throw new AppError('Google Calendar is not connected', 409);
    }

    const refreshToken = decryptGoogleToken(connection.refreshToken);


    const oauthClient = new OAuth2Client(
        config.google.clientId,
        config.google.clientSecret,
        config.google.redirectUrl,
    );

    oauthClient.setCredentials({
      refresh_token: refreshToken,
    });

    await oauthClient.getAccessToken();

    return google.calendar({
      version: 'v3',
      auth: oauthClient,
    });
  } catch (error) {
    const googleError = error.response?.data?.error;
    const errorMessage = error.message || '';

    if (
      googleError === 'invalid_grant' ||
    /\binvalid_grant\b/i.test(errorMessage)
    ) {
      throw new AppError(
          `Google Calendar authorization has expired or been revoked. 
           Please reconnect your Google account.`,
          409,
      );
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to connect to Google Calendar',
        500,
    );
  }
};

const createGoogleCalendarEvent = async (userId, task) => {
  try {
    if (
      !task?.id ||
      !task.title ||
      !task.dueDate
    ) {
      throw new AppError('Invalid task data for calendar event', 400);
    }

    if (task.googleEventId) {
      return {id: task.googleEventId};
    }

    const startDate = new Date(task.dueDate);

    if (Number.isNaN(startDate.getTime())) {
      throw new AppError('Invalid task due date', 400);
    }

    const endDate = new Date(
        startDate.getTime() + 60 * 60 * 1000,
    );

    const eventId = createHash('sha256')
        .update(`task:${task.id}`)
        .digest('hex');

    const calendar = await getGoogleCalendarClient(userId);

    try {
      const {data: event} = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          id: eventId,
          summary: task.title,
          description: task.description || '',
          start: {
            dateTime: startDate.toISOString(),
          },
          end: {
            dateTime: endDate.toISOString(),
          },
        },
      });

      return event;
    } catch (error) {
      if (error.code === 409 || error.response?.status === 409) {
        const {data: event} = await calendar.events.patch({
          calendarId: 'primary',
          eventId,
          requestBody: {
            summary: task.title,
            description: task.description || '',
            start: {
              dateTime: startDate.toISOString(),
            },
            end: {
              dateTime: endDate.toISOString(),
            },
          },
        });

        return event;
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to create Google Calendar event',
        502,
    );
  }
};

const updateGoogleCalendarEvent= async (userId, task)=>{
  try {
    if (!task?.googleEventId) {
      throw new AppError(
          'Task has no linked Google Calendar event',
          400,
      );
    }

    const startDate= new Date(task.dueDate);

    if (Number.isNaN(startDate.getTime())) {
      throw new AppError('Invalid task due date', 400);
    }

    const endDate= new Date(
        startDate.getTime() + 60*60*1000,
    );

    const calendar= await getGoogleCalendarClient(userId);

    const {data: event}=await calendar.events.patch({
      calendarId: 'primary',
      eventId: task.googleEventId,
      requestBody: {
        summary: task.title,
        description: task.description || '',
        start: {
          dateTime: startDate.toISOString(),
        },
        end: {
          dateTime: endDate.toISOString(),
        },
      },
    });

    return event;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (
      error.code === 404 ||
    error.response?.status === 404
    ) {
      throw new AppError(
          'Google Calendar event not found',
          404,
      );
    }

    throw new AppError(
        'Unable to update Google Calendar event',
        502,
    );
  }
};

const deleteGoogleCalendarEvent= async (userId, task)=>{
  try {
    if (!task?.googleEventId) {
      return;
    }

    const calendar= await getGoogleCalendarClient(userId);

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: task.googleEventId,
      });
    } catch (error) {
      if (error.code===404 ||
                error.response?.status===404
      ) {
        return;
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to delete Google Calendar event',
        502,
    );
  }
};
export {
  getGoogleCalendarClient,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
};
