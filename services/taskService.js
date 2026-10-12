import {
  Task,
  TaskCollaborator,
  GoogleCalendarConnection,
} from '../models/index.js';
import {Op} from 'sequelize';
import {getTaskAccess, requireTaskRole} from './taskAuthorizationService.js';

import {
  clearTaskCache,
  createTaskCacheKey,
  getCache,
  setCache,
}
  from '../utils/cache.js';
import AppError from '../utils/AppError.js';

import {
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
} from
  './googleCalendarApiService.js';

import logger from '../utils/logger.js';

export const createTask = async ({
  title,
  description,
  priority,
  dueDate,
  status,
  userId,
}) => {
  const task = await Task.create({
    title,
    description,
    priority,
    dueDate,
    status,
    userId,
  });

  try {
    const connection=await GoogleCalendarConnection.findOne({
      where: {userId},
    });

    if (connection) {
      await syncTaskCalendarEvent(task);
    }
  } catch (error) {
    logger.warn('Google Calendar sync failed for created task', {
      taskId: task.id,
      userId,
      status: error.response?.status || error.statusCode || 'unknown',
    });

    try {
      await task.update({
        googleSyncStatus: 'failed',
        googleSyncError:
          'Google Calendar synchronization failed. Retry required.',
      });
    } catch (updateError) {
      logger.error('Unable to record Calendar sync status', {
        taskId: task.id,
        userId,
      });
    }
  }

  await clearTaskCache(userId);

  return task;
};

export const getTasks = async ( userId, filters) => {
  const cacheKey=createTaskCacheKey(userId, filters);
  const cacheResult=await getCache(cacheKey);

  if (cacheResult!==null) {
    return cacheResult;
  }

  const collaborators= await TaskCollaborator.findAll({
    where: {
      userId,
    },
    attributes: ['taskId'],
  });

  const sharedTaskIds=collaborators.map(
      (collaboration)=>collaboration.taskId,
  );

  const where={
    [Op.or]: [
      {
        userId,
      },
      {
        id: {
          [Op.in]: sharedTaskIds,
        },
      },
    ],
  };

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.dueDateFrom || filters.dueDateTo) {
    where.dueDate = {};

    if (filters.dueDateFrom) {
      where.dueDate[Op.gte] = filters.dueDateFrom;
    }

    if (filters.dueDateTo) {
      where.dueDate[Op.lte] =filters.dueDateTo;
    }
  }

  let orderBy = [];

  if (filters.sortBy === 'dueDate') {
    orderBy = [
      [
        'dueDate',
                filters.order === 'desc' ? 'DESC' : 'ASC',
      ],
    ];
  }

  if (filters.sortBy === 'priority') {
    orderBy = [
      ['priority', filters.order === 'desc' ? 'DESC' : 'ASC'],
    ];
  }

  const pageNumber = Number(filters.page);
  const pageSize = Number(filters.limit);
  const offset = (pageNumber - 1) * pageSize;

  const {count, rows} = await Task.findAndCountAll({
    where,
    order: orderBy,
    limit: pageSize,
    offset,
  });

  const result= {
    tasks: rows,
    totalTasks: count,
    currentPage: pageNumber,
    totalPages: Math.ceil(count / pageSize),
    limit: pageSize,
  };

  await setCache(cacheKey, result);

  return result;
};

export const getTaskById = async (taskId, userId) => {
  const {task}=await getTaskAccess(taskId, userId);

  return task;
};

export const updateTask = async (taskId, userId, taskData) => {
  const {task} = await requireTaskRole(
      taskId,
      userId,
      ['owner', 'editor'],
  );

  await task.update(taskData);

  try {
    const connection = await GoogleCalendarConnection.findOne({
      where: {userId: task.userId},
    });

    if (connection) {
      await syncTaskCalendarEvent(task);
    }
  } catch (error) {
    logger.warn('Google Calendar sync failed for updated task', {
      taskId: task.id,
      userId: task.userId,
      status: error.response?.status ||
        error.statusCode ||
        'unknown',
    });

    try {
      await task.update({
        googleSyncStatus: 'failed',
        googleSyncError:
          'Google Calendar synchronization failed. Retry required.',
      });
    } catch (updateError) {
      logger.error('Unable to record Calendar sync status', {
        taskId: task.id,
        userId: task.userId,
      });
    }
  }

  await clearTaskCache(userId);

  if (Number(task.userId) !== Number(userId)) {
    await clearTaskCache(task.userId);
  }

  return task;
};

export const deleteTask = async (
    taskId,
    userId,
) => {
  const {task} = await requireTaskRole(taskId, userId, ['owner']);

  const collaborators=await TaskCollaborator.findAll({
    where: {taskId: task.id},
    attributes: ['userId'],
  });

  if (task.googleEventId) {
    await deleteGoogleCalendarEvent(task.userId, task);
  }
  await task.destroy();

  const affectedUserIds= new Set([
    Number(userId),
    Number(task.userId),
    ...collaborators.map(
        (collaborator)=>Number(collaborator.userId),
    ),
  ]);

  await Promise.all(
      [...affectedUserIds].map((affectedUserId)=>
        clearTaskCache(affectedUserId),
      ),
  );
};

export const syncTaskWithGoogleCalendar = async (
    taskId,
    userId,
) => {
  const {task} = await requireTaskRole(
      taskId,
      userId,
      ['owner'],
  );

  const connection = await GoogleCalendarConnection.findOne({
    where: {userId: task.userId},
  });

  if (!connection) {
    throw new AppError(
        'Connect Google Calendar before syncing this task',
        409,
    );
  }

  try {
    await syncTaskCalendarEvent(task);

    await clearTaskCache(userId);

    return task;
  } catch (error) {
    logger.warn('Google Calendar retry failed', {
      taskId: task.id,
      userId: task.userId,
      status: error.response?.status ||
        error.statusCode ||
        'unknown',
    });

    try {
      await task.update({
        googleSyncStatus: 'failed',
        googleSyncError:
          'Google Calendar synchronization failed. Retry required.',
      });
    } catch (updateError) {
      logger.error('Unable to record Calendar sync status', {
        taskId: task.id,
        userId: task.userId,
      });
    }

    await clearTaskCache(userId);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to synchronize task with Google Calendar',
        502,
    );
  }
};

export const syncExistingTasksWithGoogleCalendar = async (userId) => {
  const parsedUserId = Number(userId);

  if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  const connection = await GoogleCalendarConnection.findOne({
    where: {userId: parsedUserId},
  });

  if (!connection) {
    throw new AppError(
        'Connect Google Calendar before syncing tasks',
        409,
    );
  }

  const tasks = await Task.findAll({
    where: {userId: parsedUserId},
    order: [['id', 'ASC']],
  });

  const result = {
    total: tasks.length,
    synced: 0,
    failed: 0,
  };

  for (const task of tasks) {
    try {
      await syncTaskCalendarEvent(task);

      result.synced++;
    } catch (error) {
      result.failed++;

      logger.warn('Google Calendar sync failed for existing task', {
        taskId: task.id,
        userId: parsedUserId,
        status: error.response?.status ||
        error.statusCode ||
        'unknown',
      });

      try {
        await task.update({
          googleSyncStatus: 'failed',
          googleSyncError:
            'Google Calendar synchronization failed. Retry required.',
        });
      } catch (updateError) {
        logger.error('Unable to record Calendar sync status', {
          taskId: task.id,
          userId: parsedUserId,
        });
      }
    }
  }

  await clearTaskCache(parsedUserId);

  return result;
};

export const syncTaskCalendarEvent = async (task) => {
  let event;

  if (task.googleEventId) {
    try {
      event = await updateGoogleCalendarEvent(task.userId, task);
    } catch (error) {
      if (error.statusCode !== 404) {
        throw error;
      }

      await task.update({
        googleEventId: null,
        googleSyncStatus: 'pending',
      });

      event = await createGoogleCalendarEvent(task.userId, task);
    }
  } else {
    event = await createGoogleCalendarEvent(task.userId, task);
  }

  await task.update({
    googleEventId: event.id,
    googleSyncStatus: 'synced',
    googleSyncError: null,
  });

  return event;
};
