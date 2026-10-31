import cron from 'node-cron';
import {Op} from 'sequelize';

import sequelize from '../connection/database.js';
import {
  Task,
  User,
  TaskReminder,
} from '../models/index.js';

import sendTaskReminderEmail from '../services/emailService.js';
import logger from '../utils/logger.js';

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 2 * 60 * 1000;
const BATCH_SIZE = 10;

const claimDueReminders = async () => {
  const now = new Date();

  return sequelize.transaction(async (transaction) => {
    const reminders = await TaskReminder.findAll({
      where: {
        remindAt: {[Op.lte]: now},
        [Op.or]: [
          {
            status: 'pending',
            [Op.or]: [
              {nextAttemptAt: null},
              {nextAttemptAt: {[Op.lte]: now}},
            ],
          },
          {
            status: 'processing',
            lockedUntil: {[Op.lte]: now},
          },
        ],
      },
      order: [['remindAt', 'ASC']],
      limit: BATCH_SIZE,
      transaction,
      lock: transaction.LOCK.UPDATE,
      skipLocked: true,
    });

    for (const reminder of reminders) {
      await reminder.update({
        status: 'processing',
        attempts: reminder.attempts + 1,
        lockedUntil: new Date(
            now.getTime() + LOCK_DURATION_MS,
        ),
      }, {transaction});
    }

    return reminders.map((reminder) => reminder.id);
  });
};


const processReminder = async (reminderId) => {
  const reminder = await TaskReminder.findByPk(reminderId);

  if (!reminder || reminder.status !== 'processing') {
    return;
  }

  try {
    const task = await Task.findByPk(reminder.taskId);

    if (!task || task.status === 'completed') {
      await reminder.update({
        status: 'cancelled',
        lockedUntil: null,
      });
      return;
    }

    const updatedRemindAt = new Date(
        new Date(task.dueDate).getTime() -
        reminder.minutesBefore * 60 * 1000,
    );

    if (
      updatedRemindAt.getTime() !==
      new Date(reminder.remindAt).getTime()
    ) {
      if (updatedRemindAt <= new Date()) {
        await reminder.update({
          status: 'cancelled',
          lockedUntil: null,
          nextAttemptAt: null,
        });
        return;
      }

      await reminder.update({
        remindAt: updatedRemindAt,
        status: 'pending',
        nextAttemptAt: null,
        lockedUntil: null,
      });
      return;
    }

    const user = await User.findByPk(reminder.userId);

    if (!user) {
      await reminder.update({
        status: 'cancelled',
        lockedUntil: null,
      });
      return;
    }

    await sendTaskReminderEmail({
      to: user.email,
      taskTitle: task.title,
      dueDate: task.dueDate,
    });

    await reminder.update({
      status: 'sent',
      sentAt: new Date(),
      nextAttemptAt: null,
      lockedUntil: null,
    });
  } catch (error) {
    const attempts = reminder.attempts;
    const permanentlyFailed = attempts >= MAX_ATTEMPTS;

    const retryDelayMs = Math.min(
        60 * 1000 * (2 ** (attempts - 1)),
        60 * 60 * 1000,
    );

    await reminder.update({
      status: permanentlyFailed ? 'failed' : 'pending',
      nextAttemptAt: permanentlyFailed ?
        null : new Date(Date.now() + retryDelayMs),
      lockedUntil: null,
    });

    logger.error('Task reminder processing failed', {
      reminderId,
      attempts,
      permanentlyFailed,
      message: error.message,
    });
  }
};


const processTaskReminders = async () => {
  try {
    const reminderIds = await claimDueReminders();

    for (const reminderId of reminderIds) {
      await processReminder(reminderId);
    }
  } catch (error) {
    logger.error('Failed to process task reminders', {
      message: error.message,
    });
  }
};

const startTaskReminderJob = () => {
  cron.schedule('* * * * *', processTaskReminders);
};

export default startTaskReminderJob;
