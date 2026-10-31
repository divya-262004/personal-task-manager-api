import {Op} from 'sequelize';

import {Task} from '../models/index.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const getDailyDigestTasks = async (
    userId,
    digestDate,
    now = new Date(),
) => {
  try {
    const parsedUserId = Number(userId);

    if (!Number.isSafeInteger(parsedUserId) || parsedUserId <= 0) {
      throw new AppError('Invalid user ID', 400);
    }

    if (
      typeof digestDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(digestDate)
    ) {
      throw new AppError('Invalid digest date', 400);
    }

    const startToday = new Date(
        `${digestDate}T00:00:00+05:30`,
    );

    const [year, month, day] = digestDate.split('-').map(Number);
    const calendarDate = new Date(Date.UTC(year, month - 1, day));

    if (
      Number.isNaN(startToday.getTime()) ||
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day
    ) {
      throw new AppError('Invalid digest date', 400);
    }

    const endToday = new Date(
        startToday.getTime() + DAY_MS,
    );

    const taskDueToday = await Task.findAll({
      where: {
        userId: parsedUserId,
        status: 'pending',
        dueDate: {
          [Op.gte]: new Date(
              Math.max(startToday.getTime(), now.getTime()),
          ),
          [Op.lt]: endToday,
        },
      },
      order: [['dueDate', 'ASC']],
    });

    const overdue = await Task.findAll({
      where: {
        userId: parsedUserId,
        status: 'pending',
        dueDate: {
          [Op.lt]: now,
        },
      },
      order: [['dueDate', 'ASC']],
    });

    const highPriority = await Task.findAll({
      where: {
        userId: parsedUserId,
        status: 'pending',
        priority: 'high',
        dueDate: {
          [Op.gte]: endToday,
        },
      },
      order: [['dueDate', 'ASC']],
    });

    return {
      taskDueToday,
      overdue,
      highPriority,
    };
  } catch (error) {
    logger.error('Failed to retrieve daily digest tasks', {
      userId,
      digestDate,
      message: error.message,
      stack: error.stack,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
        'Unable to retrieve daily digest tasks',
        500,
    );
  }
};

export default getDailyDigestTasks;
