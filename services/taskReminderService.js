import {TaskReminder} from '../models/index.js';
import {requireTaskRole} from './taskAuthorizationService.js';
import AppError from '../utils/AppError.js';

const createTaskReminder= async (
    taskId,
    userId,
    minutesBefore,
)=>{
  const {task}=await requireTaskRole(
      taskId,
      userId,
      ['owner', 'editor'],
  );

  const remindAt=new Date(
      new Date(task.dueDate).getTime()-
        minutesBefore * 60 *1000,
  );

  if (remindAt<=new Date()) {
    throw new AppError(
        'Reminder time must be in the future',
        400,
    );
  }

  const reminder= await TaskReminder.create({
    taskId,
    userId,
    minutesBefore,
    remindAt,
    status: 'pending',
  });

  return reminder;
};

const getTaskReminders=async (taskId, userId)=>{
  await requireTaskRole(
      taskId,
      userId,
      ['owner', 'editor', 'viewer'],
  );

  const reminders=await TaskReminder.findAll({
    where: {
      taskId,
    },
    order: [['remindAt', 'ASC']],
  });

  return reminders;
};

const updateTaskReminder= async (
    reminderId,
    userId,
    minutesBefore,
)=>{
  const reminder=await TaskReminder.findOne({
    where: {
      id: reminderId,
      userId,
    },
  });

  if (!reminder) {
    throw new AppError('Task not found', 404);
  }

  const {task} = await requireTaskRole(
      reminder.taskId,
      userId,
      ['owner', 'editor'],
  );

  const remindAt=new Date(
      new Date(task.dueDate).getTime()-
      minutesBefore*60*1000);

  if (remindAt<=new Date()) {
    throw new AppError(
        'Reminder time must be in future',
        400,
    );
  }

  await reminder.update({
    minutesBefore,
    remindAt,
    status: 'pending',
    nextAttempt: null,
    lockedUntil: null,
  });

  return reminder;
};

export {
  createTaskReminder,
  getTaskReminders,
  updateTaskReminder,
};

